# anystyle-server.rb
require 'sinatra'
require 'json'
require 'anystyle'
require 'citeproc' 

set :bind, '0.0.0.0'
set :port, 4567

# AnyStyle::Parser.defaults[:model] = File.expand_path('custom.mod', __dir__)

post '/parse' do
  content_type :json

  body    = request.body.read
  payload = body.empty? ? {} : JSON.parse(body) rescue {}
  refs    = payload['references']

  input =
    case refs
    when Array
      refs.join("\n")
    when String
      refs
    end

  halt 400, { error: 'No references provided' }.to_json unless input&.strip&.length&.positive?

  # analog zu anystyle.io:
  parser  = AnyStyle.parser
  # erst nur die Labels bestimmen (Wapiti-Sequenz)
  dataset = parser.parse(input, format: :wapiti)
  # dann ins CSL-Format überführen, Normalisierer laufen lassen
  result  = parser.format_csl(dataset, date_format: 'citeproc')

  result.to_json
end
