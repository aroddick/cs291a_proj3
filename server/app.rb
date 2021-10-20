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
connections = {}

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


broadcast_events = [
  "data: #{{
    "status" => "Server start",
    "created" => Time.now.to_i
  }.to_json}\nevent: ServerStatus\nid: #{SecureRandom.uuid}\n\n"
]


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

EventMachine.schedule do
  EventMachine.add_periodic_timer(SCHEDULE_TIME) do
    # Change this for any timed events you need to schedule.
    # puts "This message will be output to the server console every #{SCHEDULE_TIME} seconds"
    for connect in connections.values do
      connect << 
        "data: #{{
          "status" => "Server uptime",
          "created" => Time.now.to_i
        }.to_json}\nevent: ServerStatus\nid: #{SecureRandom.uuid}\n\n"
    end
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
  response.headers["Access-Control-Allow-Origin"] = "*"
  200
end

get '/stream/:token', provides: 'text/event-stream' do
  PP.pp(params)
  if(user_stream_token.has_key?(params['token']))
    if(user_stream_token[params['token']][1] == false)
      user_stream_token[params['token']][1] = true
      username = user_stream_token[params['token']][0]
      status 200
      headers 'Access-Control-Allow-Origin' => '*'
      headers 'Connection' => 'keep-alive'
      # for this current connection at hand
      # that corresponds to the user with the provided 
      # stream token
      stream(:keep_open) do |connection|

        # connection << "Welcome\n\n"
        # PP.pp(user_stream_token.values)
        # since this is the first time the connection is being added, will 
        # want to notify other streams that new connection was added
        connection <<
          "data: #{{
            "users" => user_stream_token.values.map{ |value| value[0]},
            "created" => Time.now.to_i
          }.to_json}\nevent: Users\nid: #{SecureRandom.uuid}\n\n"

        # place past messages into this current connection
        # PP.pp(broadcast_events)
        for message in broadcast_events do
          connection << message
        end

        # place connection into connections
        connections[username] = connection

        # broadcast join message to all other users
        for connect in connections.values do
          connect << 
            "data: #{{
              "user" => username,
              "created" => Time.now.to_i
            }.to_json}\nevent: Join\nid: #{SecureRandom.uuid}\n\n"
        end

        # this is for the connections which are closed
        connection.callback do
          # puts 'callback'
          username = connections.key(connection)
          for connect in connections do
            connect << 
              "data: #{{
                "user" => username,
                "created" => Time.now.to_i
              }.to_json}\nevent: Part\nid: #{SecureRandom.uuid}\n\n"
          end
          connections.delete(username)
        end
      end
      
    else
      status 409
    end
  else
    status 403
  end
end

post '/login' do
  # if username && password was not provided
  headers 'Access-Control-Allow-Origin' => '*'
  PP.pp(params)
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
        # check and update the message and stream tokens
        if(user_stream_token.has_value?(params['username']))
          status 409
          return
        end
      end
    # since given username not found create new user
    else
      registered[params['username']] = params['password']
    end

    # no stream exists yet, so create new streams and log in
    message_token = SecureRandom.uuid
    stream_token = SecureRandom.uuid
    user_message_token[message_token] = params['username']
    user_stream_token[stream_token] = [params['username'], false]

    # 201 with the JSON body
    status 201
    
    data = {"message_token" => message_token, "stream_token" => stream_token}
    PP.pp(data)
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
  headers 'Access-Control-Allow-Headers' => 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  headers 'Access-Control-Expose-Headers' => 'token'
  # check if message was provided
  PP.pp(request)
  if(request.params.keys.length == 1 && request.params['message'] != nil && request.params['message'] != "")
    # header not provided
    if(request.env['HTTP_AUTHORIZATION'] == nil)
      puts('header not provided')
      status 403
    else
      PP.pp(request.env['HTTP_AUTHORIZATION'])
      authorization = request.env['HTTP_AUTHORIZATION'].split(' ')
      token = authorization[1]
      PP.pp(token)
      if(user_message_token.has_key?(token))
        user = user_message_token[token]
        if(user_stream_token.has_value?([user, true]))
          message = request.params['message']
          messageArray = message.split(' ')
          if message == '/quit'
            disconnectEvent = 
              "data: #{{
                "created" => Time.now.to_i
              }.to_json}\nevent: Disconnect\nid: #{SecureRandom.uuid}\n\n"
            connection << disconnectEvent
            connection.close()
            # deletes stream token user pair from db
            user_stream_token.delete(user_stream_token.key([user, true]))
            # deletes message token user pair from db
            user_message_token.delete(token)

          elsif messageArray[0] == '/kick' && messageArray.length == 2
            if connections.has_key?(messageArray[1])
              connectionToRemove = connections[messageArray[1]]
              connectionToRemove.close()
            else
              status 409
              return
            end
          elsif message == '/reconnect'
            connectionToRemove = connections[user]
            connectionToRemove.close()
          else
            messageEvent = 
              "data: #{{
                "user" => user,
                "message" => message,
                "created" => Time.now.to_i
              }.to_json}\nevent: Message\nid: #{SecureRandom.uuid}\n\n"
            connections.values.each do |connection|
              connection << messageEvent
            end
            broadcast_events.append(messageEvent)
          end

          # deletes previous message token / username stored
          user_message_token.delete(token)
          # found unique tmpMessage so update
          newToken = SecureRandom.uuid
          user_message_token[newToken] = user
          PP.pp token
          PP.pp newToken
          PP.pp user_message_token
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
        PP.pp token
        PP.pp user_message_token
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

