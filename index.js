const express = require('express')
const app = express()
const client = require('prom-client');
const axios = require('axios');

const delay = ms => new Promise(res => setTimeout(res, ms));

//expose all metrics 
//const collectDefaultMetrics = client.collectDefaultMetrics;
//collectDefaultMetrics();

//register custom metrics
const Registry = client.Registry;
const register = new Registry();
const histogram = new client.Histogram({
    name: 'Histogram:http_request_duration',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'status_code'],
    buckets: [1, 5, 15, 50, 100, 500] //http is so fast we have to put it 0.0001 to see it work
  });
register.registerMetric(histogram);



const counter = new client.Counter({
    name: 'Counter:Count_Demo',
    help: 'Demo Counter Work'
  });

register.registerMetric(counter);


const gauge = new client.Gauge({ name: 'Gauge:Gauge_Demo', help: 'Demo Gauge Work' });
register.registerMetric(gauge);


const summary = new client.Summary({
    name: 'Summary:Summary_Demo',
    help: 'Demo Summary Work',
    percentiles: [ 0.1, 0.5 , 0.75, 0.9],
  });

  register.registerMetric(summary);

app.get('/', (req, res) => res.json({
    'GET /': 'All Routes',
    'GET /hello': '{hello:world}',
    'GET /metrics': 'Metrics data',
    'GET /Histogram': 'Demo Histogram',
    'GET /Counter': 'Demo Counter',
    'GET /Summary': 'Demo Summary',
  }))


  app.get('/histogram', async (req, res) => {
    const end = histogram.startTimer();
    await delay(5000);
    res.send('Hello Historgram!')
    end({ method: req.method, 'status_code': 200 });
  })




  app.get("/counter", function(req, res) {
    res.send( 'counter+')
    counter.inc(1);
  });


  app.get("/gauge", function(req, res) {
    res.send( 'set gauge =10')
    gauge.set(10);
  });
  app.get("/gaugeplus", function(req, res) {
    res.send('gauge+')
    gauge.inc(2);
  });
  app.get("/gaugeminus", function(req, res) {
    res.send( 'gauge+')
    gauge.dec(2);
  });



  app.get('/summary', async (req, res) => {
    const observe_response_time = summary.startTimer();
  
    res.send( 'summary')
    // observe_response_time();
    summary.observe( observe_response_time());


  })



  // hello world rest endpoint 
  app.get('/hello', (req, res) => res.json({hello: 'world'}));


  app.get('/metrics', (async (request, response) => {
    response.set('Content-Type', client.register.contentType);
    response.send(await client.register.metrics());
  }));



  
  app.listen(8080, function () {
    console.log('Listening at http://localhost:8080')
  })