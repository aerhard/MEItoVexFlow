require.config({
  baseUrl : '../src',
  paths : {
    'jquery' : '../bower_components/jquery/dist/jquery.min',
    'vex' : '../bower_components/vexflow/releases/vexflow-min',
    'common' : '../src/common',
    'mei2vf' : '../src/mei2vf',
    'meilib' : '../src/meilib',
    'vexflow' : '../src/mei2vf/vexflow'
  },
  shim : {
    'vex' : {
      exports : 'Vex'
    }
  }
});

