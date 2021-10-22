# frozen_string_literal: true

require 'eventmachine'
require 'sinatra'
require 'jwt'
require 'securerandom'
require 'pp'
require 'json'

require 'sinatra/cross_origin'

SCHEDULE_TIME = 3600

# key: username
# value: connection
$connections = {}

# past hundred messages and sse
# for join, have
#   []
# broadcast_events = [{
#   "data" => {
#     "created" => Time.now.to_i,
#     "user" => username
#   },
#   "event" => "Join",
#   "id" => SecureRandom.uuid
# }]

id = SecureRandom.uuid

$broadcast_events = {"#{id}":
  "data: #{{
    "status" => "Server start",
    "created" => Time.now.to_i
  }.to_json}\nevent: ServerStatus\nid: #{id}\n\n"}

# users registered will be placed in hash table
# key: username
# value: password
registered = {}

# key: uuid
# value: username
user_message_token = {}

# key: uuid
# value: username
user_stream_token = {}

def broadcast_message(id:, event:)
  for connect in $connections.values do
    connect << "#{event}"
  end
  $broadcast_events[id] = event
end

def send_message_event(message:)
  event_id = SecureRandom.uuid
  message_event = 
    "data: #{{
      "user" => user,
      "message" => message,
      "created" => Time.now.to_i
    }.to_json}\nevent: Message\nid: #{event_id}\n\n"
  broadcast_message(id: event_id, event: message_event)
end

def send_join_event(username:)
  event_id = SecureRandom.uuid
  join_event = 
    "data: #{{
      "user" => username,
      "created" => Time.now.to_i
    }.to_json}\nevent: Join\nid: #{event_id}\n\n"
  broadcast_message(id: event_id, event: join_event)
end

def send_part_event(username:)
  event_id = SecureRandom.uuid
  part_event = 
    "data: #{{
      "user" => username,
      "created" => Time.now.to_i
    }.to_json}\nevent: Part\nid: #{event_id}\n\n"
  broadcast_message(id: event_id, event: part_event)
end

def send_kick_event(username1:, username2:)
  event_id = SecureRandom.uuid
  kick_event =
    "data: #{{
      "status" => "#{username1} kicked #{username2}",
      "created" => Time.now.to_i
    }.to_json}\nevent: ServerStatus\nid: #{event_id}\n\n"
  broadcast_message(id: event_id, event: kick_event)
end

def send_server_event()
  event_id = SecureRandom.uuid
  server_event = 
    "data: #{{
      "status" => "Server uptime",
      "created" => Time.now.to_i
    }.to_json}\nevent: ServerStatus\nid: #{event_id}\n\n"
  broadcast_message(id: event_id, event: server_event)
end

def send_users(connection:, user_stream_token:)
  event_id = SecureRandom.uuid
  user_event =
    "data: #{{
      "users" => $connections.keys,
      "created" => Time.now.to_i
    }.to_json}\nevent: Users\nid: #{event_id}\n\n"
  send_message(id: event_id, event: user_event, connection: connection)
end

def send_message(id:, event:, connection:)
  connection << event
  $broadcast_events[id] = event
end

EventMachine.schedule do
  EventMachine.add_periodic_timer(SCHEDULE_TIME) do
    # Change this for any timed events you need to schedule.
    # puts "This message will be output to the server console every #{SCHEDULE_TIME} seconds"
    send_server_event()
  end
end

configure do
  enable :cross_origin
end
before do
  response.headers['Access-Control-Allow-Origin'] = '*'
end

options '*' do
  response.headers["Allow"] = "GET, PUT, POST, DELETE, OPTIONS"
  response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Accept, X-User-Email, X-Auth-Token"
  200
end

get '/stream/:token', provides: 'text/event-stream' do
  if(user_stream_token.has_key?(params['token']))
    if(user_stream_token[params['token']][1] == false)
      user_stream_token[params['token']][1] = true
      username = user_stream_token[params['token']][0]
      status 200
      headers 'Connection' => 'keep-alive'
      # for this current connection at hand
      # that corresponds to the user with the provided 
      # stream token
      stream(:keep_open) do |connection|

        # place connection into connections
        $connections[username] = connection
        # connection << "Welcome\n\n"
        # since this is the first time the connection is being added, will 
        # want to notify other streams that new connection was added

        # Check if user has joined before
        id = nil
        match = false
        if(request.env['HTTP_LAST_EVENT_ID'] != nil && $broadcast_events.has_key?(request.env['HTTP_LAST_EVENT_ID']))
          id = request.env['HTTP_LAST_EVENT_ID']
        else
          match = true
          send_users(connection: connection, user_stream_token: user_stream_token)
        end

        # place past messages into this current connection
        for key, value in $broadcast_events do
          if(match == true && (value.include?("event: ServerStatus") || value.include?("event: Message")|| (id != nil && !value.include?("event: Disconnect"))))
            connection << value
          elsif(id != nil && key == id)
            match = true
          end
        end

        # broadcast join message to all other users
        send_join_event(username: username)
        # this is for the connections which are closed
        connection.callback do
          # puts 'callback'
          username = $connections.key(connection)
          send_part_event(username: username)
          $connections.delete(username)
          user_stream_token[user_stream_token.key([username, true])][1] = false
        end
      end
      
    else
      status 409
    end
  else
    PP.pp(request);
    PP.pp(user_stream_token);
    status 403
  end
end

post '/login' do
  # if username && password was not provided
  if(params['username'] == nil || params['username'] == "" || params['password'] == nil || params['password'] == "")
    PP.pp("params arent valid");
    status 422
    return
  # was provided
  elsif(params.keys.length == 2 && params['username'] != nil && params['password'] != nil)
    # check if username exists in the database
    if(registered.has_key?(params['username']))
      # check if the corresponding password provided matches that of the one stored
      if(registered[params['username']] != params['password'])
        status 403
        return
      # password and username correct
      else
        # check if stream is currently open
        if(user_stream_token.has_value?([params['username'], true]))
          status 409
          return
        end
      end
    # since given username not found create new user
    else
      registered[params['username']] = params['password']
    end

    # 
    # deletes stream token user pair from db
    user_stream_token.delete(user_stream_token.key([params['username'], false]))
    # deletes message token user pair from db
    user_message_token.delete(user_message_token.key(params['username']))

    # no stream exists yet, so create new streams and log in
    message_token = SecureRandom.uuid
    stream_token = SecureRandom.uuid
    user_message_token[message_token] = params['username']
    user_stream_token[stream_token] = [params['username'], false]

    # 201 with the JSON body
    status 201
    
    data = {"message_token" => message_token, "stream_token" => stream_token}
    "#{data.to_json}"
  # set of fields do not match expected
  else
    # 422 if the set of provided fields do not exactly match the two expected fields
    PP.pp("fields dont match");
    status 422
  end
end

post '/message' do
  headers 'Access-Control-Allow-Origin' => '*'
  headers 'Access-Control-Request-Method' => '*'
  headers 'Access-Control-Expose-Headers' => 'token'
  # check if message was provided
  if(request.params.keys.length == 1 && request.params['message'] != nil && request.params['message'] != "")
    PP.pp(request.params['message'])
    # header not provided
    if(request.env['HTTP_AUTHORIZATION'] == nil)
      puts('header not provided')
      status 403
      return
    else
      PP.pp(request.env['HTTP_AUTHORIZATION'])
      authorization = request.env['HTTP_AUTHORIZATION'].split(' ')
      if(authorization[0] != "Bearer")
        status 403
        return
      end
      token = authorization[1]
      PP.pp(token)
      if(user_message_token.has_key?(token))
        user = user_message_token[token]
        if(user_stream_token.has_value?([user, true]))
          message = request.params['message']
          messageArray = message.split(' ')
          event_id = SecureRandom.uuid
          if message == '/quit'
            connection_to_remove = $connections[user]
            disconnect_event = 
              "data: #{{
                "created" => Time.now.to_i
              }.to_json}\nevent: Disconnect\nid: #{event_id}\n\n"
            send_message(id: event_id, event: disconnect_event, connection: connection_to_remove)
            connection_to_remove.close()

          elsif messageArray[0] == '/kick' && messageArray.length == 2
            if $connections.has_key?(messageArray[1])
              connection_to_remove = $connections[messageArray[1]]
              send_kick_event(username1: user, username2: messageArray[1])
              connection_to_remove.close()
            else
              status 409
              return
            end
          elsif message == '/reconnect'
            connection_to_remove = $connections[user]
            connection_to_remove.close()
          else
            messageEvent = 
              "data: #{{
                "user" => user,
                "message" => message,
                "created" => Time.now.to_i
              }.to_json}\nevent: Message\nid: #{event_id}\n\n"
            $connections.values.each do |connection|
              connection << messageEvent
            end
            $broadcast_events[event_id] = messageEvent
          end

          # deletes previous message token / username stored
          user_message_token.delete(token)
          # found unique tmpMessage so update
          newToken = SecureRandom.uuid
          user_message_token[newToken] = user
          status 201
          headers "Token" => newToken
        else
          # re create new message token
          status 409
          # no stream exists yet
          # deletes previous message token / username stored
          user_message_token.delete(token)
          newToken = SecureRandom.uuid
          user_message_token[newToken] = user
          headers "Token" => newToken
        end
      else
        puts('message token doesnt exist')
        status 403
      end
    end
  # message blank or params not match
  else
    puts('message blank / params no match')
    status 422
    
  end
end

=begin
1. ask about message and stream tokens
  you mentioned about jwt 
  ask about storing jwt tokens


  use SecureRandom.uuid for message, stream, and id of sse
  or with secure random do 
    SecureRandom.uuid


        require 'securerandom'
        # no stream exists yet, so create new streams and log in
          tmpMessage = SecureRandom.hex(15)
          while(user_message_token.has_key?(tmpMessage))
            tmpMessage = SecureRandom.hex(15)
          end
          # deletes previous message token / username stored
          user_message_token.delete(user_message_token.key(params['username']))
          # found unique tmpMessage so update
          user_message_token[tmpMessage] = params['username']

          tmpStream = SecureRandom.hex(15)
          while(user_stream_token.has_key?(tmpStream))
            tmpStream = SecureRandom.hex(15)
          end
          # deletes previous message token / username stored
          user_stream_token.delete(user_stream_token.key(params['username']))
          # found unique tmpStream
          user_stream_token[tmpStream] = [params['username'], false]


=end

