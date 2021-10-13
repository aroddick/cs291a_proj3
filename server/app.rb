# frozen_string_literal: true

require 'eventmachine'
require 'sinatra'
require 'securerandom'
# require 'jwt'

SCHEDULE_TIME = 32
connections = []

# users registered will be placed in hash table
# key: username
# value: password
registered = {}

# key: messageToken
# value: username
user_message_token = {}

# key: streamToken
# value: username
user_stream_token = {}

EventMachine.schedule do
  EventMachine.add_periodic_timer(SCHEDULE_TIME) do
    # Change this for any timed events you need to schedule.
    puts "This message will be output to the server console every #{SCHEDULE_TIME} seconds"
  end
end

get '/stream/:token', provides: 'text/event-stream' do
  headers 'Access-Control-Allow-Origin' => '*'
  stream(:keep_open) do |connection|
    connections << connection

    connection << "data: Welcome!\n\n"

    connection.callback do
      puts 'callback'
      connections.delete(connection)
    end
  end
  # check if the token is valid
  if(user_stream_token.has_key?(params['token']))
    
  else
    status 403
    'Done'
  end
end

post '/login' do
  # if username && password was not provided
  
  # 
  # 422 if either password or username is blank
  #

  if(params['username'] == nil || params['username'] == "" || params['password'] == nil || params['password'] == "")
    status 422
    'Done'
  # was provided
  elsif( len(request.params) == 2 && params['username'] != nil && params['password'] != nil)
    # check if username exists in the database
    if(registered.has_key?(params['username']))
      # check if the corresponding password provided matches that of the one stored
      
      #
      # 403 if the provided username and password combination does not match that of an existing user
      #

      if(registered[params['username']] != params['password'])
        status 403
        'Done'
      # password and username correct
      else
        # check and update the message and stream tokens
        # a stream exists for that user already

        #
        # 409 if there is already a stream open for the username
        #

        if(user_stream_token.has_value?(params['username']))
          status 409
          'Done'
        else
          #
          # 201 with the JSON body
          #

          # no stream exists yet, so create new streams and log in
          tmpMessage = SecureRandom.hex(15)
          tmpStream = SecureRandom.hex(15)
          while(user_message_token.has_key?(tmpMessage))
            tmpMessage = SecureRandom.hex(15)
          end
          # deletes previous message token / username stored
          user_message_token.delete(user_message_token.key(params['username']))
          # found unique tmpMessage so update
          user_message_token[tmpMessage] = params['username']

          while(user_stream_token.has_key?(tmpStream))
            tmpStream = SecureRandom.hex(15)
          end
          # deletes previous message token / username stored
          user_stream_token.delete(user_stream_token.key(params['username']))
          # found unique tmpStream
          user_stream_token[tmpStream] = params['username']

          status 201
          data = {"message_token" => tmpMessage, "stream_token" => tmpStream}
          data.to_json
        end
      end
    # since given username not found create new user
    else
      #
      # 201 with the JSON body
      #

      # no stream exists yet, so create new streams and log in
      tmpMessage = SecureRandom.hex(15)
      tmpStream = SecureRandom.hex(15)
      while(user_message_token.has_key?(tmpMessage))
        tmpMessage = SecureRandom.hex(15)
      end
      # found unique tmpMessage so update
      user_message_token[tmpMessage] = params['username']

      while(user_stream_token.has_key?(tmpStream))
        tmpStream = SecureRandom.hex(15)
      end
      # found unique tmpStream
      user_stream_token[tmpStream] = params['username']

      registered[params['username']] = params['password']
      status 201
      data = {"message_token" => tmpMessage, "stream_token" => tmpStream}
      data.to_json
    end
  # set of fields do not match expected
  
  #
  # 422 if the set of provided fields do not exactly match the two expected fields
  #
  else
    status 422
    'Done'
  end
end

post '/message' do
  require 'pp'

  connections.each do |connection|
    connection << "data: Goodbye!\n\n"
    connection.close  # This call will trigger connection.callback
  end

  puts 'Headers'
  PP.pp(request.env['HTTP_AUTHORIZATION'])
  PP.pp(request.env.filter { |x| x.start_with?('HTTP_') })
  puts

  puts 'request.params:'
  PP.pp request.params
  PP.pp len(request.params)
  puts

  # check if message was provided
  if(len(request.params) == 1 && request.params['message'] != nil && request.params['message'] != "")
    # header not provided
    if(request.env['HTTP_AUTHORIZATION'] == nil)
      status 403
      'Done'
    else
      data = request.env['HTTP_AUTHORIZATION'].split
      token = data[1]

      # if token is invalid
      begin
        tokenDecoded = JWT.decode token, 'HS256'
      rescue JWT::ImmatureSignature
        status 403
        'Done'
      rescue JWT::VerificationError
        status 403
        'Done'
      rescue
        status 403
        'Done'
      else
        if(user_message_token.has_key?(tokenDecoded))
          user = user_message_token[tokenDecoded]
          
          if(user_message_token.has_key?(tokenDecoded))
          
          else
          end
        else
        end
      end


    end
  # message blank or params not match
  else
    status 422
    'Done'
  end

  
end

=begin
1. ask about message and stream tokens
  you mentioned about jwt 
  ask about storing jwt tokens

=end