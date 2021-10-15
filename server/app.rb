# frozen_string_literal: true

require 'eventmachine'
require 'sinatra'
require 'jwt'

SCHEDULE_TIME = 32
connections = []

# users registered will be placed in hash table
# key: username
# value: password
registered = {}

# Decrypt jwt to get both
# key: username
# value: uuid
user_message_token = {}

# Decrypt jwt to get both
# key: username
# value: uuid
user_stream_token = {}

EventMachine.schedule do
  EventMachine.add_periodic_timer(SCHEDULE_TIME) do
    # Change this for any timed events you need to schedule.
    puts "This message will be output to the server console every #{SCHEDULE_TIME} seconds"
  end
end

get '/stream/:token', provides: 'text/event-stream' do
  if(user_stream_token.has_key?(params['token']))
    if(user_stream_token[params['token']][1] == false)
      user_stream_token[params['token']][1] = true
      status 200

      headers 'Access-Control-Allow-Origin' => '*'
      stream(:keep_open) do |connection|
        connections << connection
        # connection << "data: Welcome!\n\n"
        connection.callback do
          # puts 'callback'
          connections.delete(connection)
        end
      end
      'Done'
    else
      status 409
      'Done'
    end 
  else
    status 403
    'Done'
  end
end

post '/login' do
  # if username && password was not provided
  if(params['username'] == nil || params['username'] == "" || params['password'] == nil || params['password'] == "")
    status 422
    'Done'
  # was provided
  elsif( request.params.keys.length == 2 && params['username'] != nil && params['password'] != nil)
    # check if username exists in the database
    if(registered.has_key?(params['username']))
      # check if the corresponding password provided matches that of the one stored
      if(registered[params['username']] != params['password'])
        status 403
        'Done'
      # password and username correct
      else
        # check and update the message and stream tokens
        if(user_stream_token.has_value?(params['username']))
          status 409
          'Done'
        else
          # no stream exists yet, so create new streams and log in
          tmpMessage = rand(100).to_s + params['username'] + rand(100).to_s
          while(user_message_token.has_key?(tmpMessage))
            tmpMessage = rand(100).to_s + params['username'] + rand(100).to_s
          end
          # deletes previous message token / username stored
          user_message_token.delete(user_message_token.key(params['username']))
          # found unique tmpMessage so update
          user_message_token[tmpMessage] = params['username']

          tmpStream = rand(100).to_s + params['username'] + rand(100).to_s
          while(user_stream_token.has_key?(tmpStream))
            tmpStream = rand(100).to_s + params['username'] + rand(100).to_s
          end
          # deletes previous message token / username stored
          user_stream_token.delete(user_stream_token.key(params['username']))
          # found unique tmpStream
          user_stream_token[tmpStream] = [params['username'], false]

          # 201 with the JSON body
          status 201
          data = {"message_token" => tmpMessage, "stream_token" => tmpStream}
          data.to_json
        end
      end
    # since given username not found create new user
    else
      # no stream exists yet, so create new streams and log in
      tmpMessage = rand(100).to_s + params['username'] + rand(100).to_s
      while(user_message_token.has_key?(tmpMessage))
        tmpMessage = rand(100).to_s + params['username'] + rand(100).to_s
      end
      # found unique tmpMessage so update
      user_message_token[tmpMessage] = params['username']

      tmpStream = rand(100).to_s + params['username'] + rand(100).to_s
      while(user_stream_token.has_key?(tmpStream))
        tmpStream = rand(100).to_s + params['username'] + rand(100).to_s
      end
      # found unique tmpStream
      user_stream_token[tmpStream] = [params['username'], false]

      registered[params['username']] = params['password']

      # 201 with the JSON body
      status 201
      data = {"message_token" => tmpMessage, "stream_token" => tmpStream}
      data.to_json
    end
  # set of fields do not match expected
  else
    # 422 if the set of provided fields do not exactly match the two expected fields
    status 422
    'Done'
  end
end

post '/message' do
  require 'pp'

  # puts 'Headers'
  # PP.pp(request.env['HTTP_AUTHORIZATION'])
  # PP.pp(request.env.filter { |x| x.start_with?('HTTP_') })

  # puts 'request.params:'
  # PP.pp request.params

  # check if message was provided
  if(request.params.keys.length == 1 && request.params['message'] != nil && request.params['message'] != "")
    # header not provided
    if(request.env['HTTP_AUTHORIZATION'] == nil)
      puts('header not provided')
      status 403
      'Done'
    else
      data = request.env['HTTP_AUTHORIZATION'].split
      token = data[1]
      if(user_message_token.has_key?(token))
        user = user_message_token[token]
        if(user_stream_token.has_value?([user, true]))
          stream = user_stream_token[user]
          # puts(stream)
          # puts(user_stream_token)
          message = request.params['message']
          connections.each do |connection|
            connection << message
            connection.close  # This call will trigger connection.callback
          end

          tmpMessage = rand(100).to_s + user + rand(100).to_s
          while(user_message_token.has_key?(tmpMessage))
            tmpMessage = rand(100).to_s + user + rand(100).to_s
          end
          # deletes previous message token / username stored
          user_stream_token.delete(token)
          # found unique tmpMessage so update
          user_message_token[tmpMessage] = user
          puts('stored message')
          status 200
          'Done'
        else
          # re create new message token
          puts(user_stream_token)
          puts('no stream exists 2')
          status 409
          # no stream exists yet, so create new streams and log in
          tmpMessage = rand(100).to_s + user + rand(100).to_s
          while(user_message_token.has_key?(tmpMessage))
            tmpMessage = rand(100).to_s + user + rand(100).to_s
          end
          # deletes previous message token / username stored
          user_stream_token.delete(token)
          # found unique tmpMessage so update
          user_message_token[tmpMessage] = user
          'Done'
        end
      else
        puts('message token doesnt exist')
        status 403
        'Done'
      end
    end
  # message blank or params not match
  else
    puts('message blank / params no match')
    status 422
    'Done'
  end
end

=begin
1. ask about message and stream tokens
  you mentioned about jwt 
  ask about storing jwt tokens


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

