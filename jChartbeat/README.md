# jChartbeat
A simple and lightweight jQuery plugin for the [Chartbeat API](http://api.chartbeat.com). The compiled version is less than 2k in size (500 bytes gzipped).

## Author
Matt Bango (http://mattbango.com)

## Usage
You can get set up with jChartbeat in 3 easy steps:

1. Source jQuery and jChartbeat
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js"></script>
        <script src="/path/to/jquery.jChartbeat.compiled.js"></script>

2. Initialize jChartbeat with your API Key and Domain
        <script type="text/javascript">
        $(document).ready(function() {
            $.jChartbeat({apikey: 'YOUR_API_KEY', host: 'YOUR_DOMAIN'});
        });
        </script>

3. Start calling the chartbeat API!
        <script type="text/javascript">
        $(document).ready(function() {
            $.jChartbeat({apikey: 'YOUR_API_KEY', host: 'YOUR_DOMAIN'});

            // A call to chartbeat's Top Pages API. The response is returned in a callback.
            $.jChartbeat.toppages(function(response) {
                // Do stuff with the response object
                console.log(response);
            });
        });
        </script>

## Issues
You can [report a bug or request a feature here](http://github.com/chartbeat/labs/issues)
