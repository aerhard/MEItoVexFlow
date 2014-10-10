require.config({
  baseUrl : '../src',
  paths : {
    'jquery' : '../bower_components/jquery/dist/jquery.min',
    'vex' : '../bower_components/vexflow/build/vexflow/vexflow-min',
    'common' : '../src/common',
    'mei2vf' : '../src/mei2vf',
    'meilib' : '../src/meilib'
  },
  shim : {
    'vex' : {
      exports : 'Vex'
    },

    'vexflow' : {deps : ['vex'],
      exports : 'Vex.Flow'}
  }
});

define('vexflow', ['vex'], function (Vex) {
  return Vex.Flow;
});
