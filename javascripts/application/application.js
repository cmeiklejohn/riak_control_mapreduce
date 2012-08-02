// Application object.
//
var RiakControl = Ember.Application.create({
  ready: Ember.alias('initialize')
});

// Models.
//
RiakControl.Job = Ember.Object.extend();

RiakControl.Phase = Ember.Object.extend();

// Test data.
//
RiakControl.exampleJob = {
  "id":     "test-query",
  "inputs": "goog",

  "query":  [
    {
      "map": {
               "language": "javascript",
               "source":   "function(value, keyData, arg) { var data = Riak.mapValuesJson(value)[0]; if(data.High && parseFloat(data.High) > 600.00) return [value.key]; else return [];}"
      }
    },
    {
      "map": {
               "language": "javascript",
               "source":   "function(value, keyData, arg) { return value.key; }",
               "keep":     true
      }
    }
  ]
};

// Controllers.
//
RiakControl.ApplicationController = Ember.Controller.extend();

RiakControl.MapReduceController = Ember.ObjectController.extend({

  /**
    * On initialize, load the mapreduce query and parse it.
    */
  init: function() {
    this.set('content', this.get('parseJob')(RiakControl.exampleJob));
  },

  /**
    * Given a Riak MapReduce job, parse and convert into objects.
    */
  parseJob: function(rawJob) {

    var jobHash      = rawJob,
        phasesHashes = rawJob.query,
        phaseHash,
        job,
        phase;

    // Create the job without any phases.
    //
    delete jobHash.query;

    jobHash.phases = [];

    job = RiakControl.Job.create(jobHash);

    // For each phase, create a phase object with the type, and
    // assign to each job.
    //
    phasesHashes.forEach(function(phaseHash) {
      for (var property in phaseHash) {
        if (phaseHash.hasOwnProperty(property)) {
          phaseHash[property].type = property;
          job.phases.pushObject(RiakControl.Phase.create(phaseHash[property]));
        }
      }
    });

    return job;
  }
});

// Views.
//
RiakControl.ApplicationView = Ember.View.extend({
  templateName: 'application'
});

RiakControl.MapReduceView = Ember.View.extend({
  templateName: 'mapreduce'
});

// Application router.
//
RiakControl.Router = Ember.Router.extend({
  root: Ember.Route.extend({
    index: Ember.Route.extend({
      route: '/',
      redirectsTo: 'mapreduce'
    }),

    mapreduce: Ember.Route.extend({
      route: 'mapreduce',

      connectOutlets: function(router) {
        router.get('applicationController').connectOutlet('mapReduce');
      },

      index: Ember.Route.extend({
        route: '/'
      })
    })
  })
});
