(function ($) {

  window.PTL = window.PTL || {};

  PTL.reports = {

    init: function () {

      /* Compile templates */
      this.tmpl = {results: $.template($("#language_user_activity").html()),};

      $(document).on("click", "#reports-show", function (e) {
        PTL.reports.user = $('#reports-user').val();
        PTL.reports.update();
      });

      $(document).on("click", "#current-month", function (e) {
        PTL.reports.date_range = [
          moment().date(1),
          moment()
        ];
        PTL.reports.update();

        return false;
      });

      $(document).on("click", "#previous-month", function (e) {
        PTL.reports.date_range = [
          moment().subtract({M:1}).date(1),
          moment().date(1).subtract('days', 1)
        ];

        PTL.reports.update();

        return false;
      });

      $(document).on("keypress", "#reports-user", function (e) {
        if (e.which === 13) {
          PTL.reports.user = $('#reports-user').val();

          PTL.reports.update();
        }
      });

      this.date_range = [moment().date(1), moment()]
      this.user = null;

      PTL.reports.currentRowIsEven = false;

      setTimeout(function () {
        $.history.init(function (hash) {
          var params = PTL.utils.getParsedHash(hash);

          // Walk through known report criterias and apply them to the
          // reports object
          if ('start' in params && 'end' in params) {
            PTL.reports.date_range = [
              moment(params['start']),
              moment(params['end'])
            ];
          } else {
            PTL.reports.date_range = [
              moment().date(1),
              moment()
            ];
          }

          if ('user' in params) {
            PTL.reports.user = params['user'];
          }

          $('#reports-user').val(PTL.reports.user);
          PTL.reports.buildResults();
        }, {'unescape': true});

      }, 1); // not sure why we had a 1000ms timeout here

    },

    validate: function () {
      if (PTL.reports.user) {
        return  PTL.reports.date_range.length == 2;
      } else {
        return false;
      }
    },

    update: function () {
      if (PTL.reports.validate()) {
        var newHash = [
          'user=', PTL.reports.user,
          '&start=', PTL.reports.date_range[0].format("YYYY-MM-DD"),
          '&end=', PTL.reports.date_range[1].format("YYYY-MM-DD")
        ].join('');
        $.history.load(newHash);
      } else {
        alert('Wrong input data');
      }
    },

    buildResults: function () {
      var reqData = {
        start: PTL.reports.date_range[0].format("YYYY-MM-DD"),
        end: PTL.reports.date_range[1].format("YYYY-MM-DD"),
        user: PTL.reports.user
      };

      $.ajax({
        url: 'activity',
        data: reqData,
        dataType: 'json',
        async: true,
        success: function (data) {
          $('#reports-results').empty();
          $('#reports-results').html(
            PTL.reports.tmpl.results($, {data: data}).join('')
          );
        },
        error: function (xhr, s) {
          alert('Error status: ' + xhr.status);
        }
      });
    },

    dateRangeString: function (d1, d2) {
      var res = '',
          m1 = moment(d1),
          m2 = moment(d2);

      if (m1.year() == m2.year()) {
        if (m1.month() == m2.month()) {
          if (m1.date() == m2.date()) {
            return m1.format('MMMM D, YYYY');
          } else {
            return [
              m1.format('MMMM D'), ' &mdash; ', m2.date(), m2.format(', YYYY')
            ].join('');
          }
        } else {
          return [
            m1.format('MMMM D'), ' &mdash; ', m2.format('MMMM D, YYYY')
          ].join('');
        }
      } else {
        return [
          m1.format('MMMM D, YYYY'), ' &mdash; ', m2.format('MMMM D, YYYY')
        ].join('');
      }
    },

    formatDate: function (d) {
      var m = moment(d);
      return m.format('MMM, D');
    },

    cycleEvenOdd: function () {
      PTL.reports.currentRowIsEven = !PTL.reports.currentRowIsEven;

      if (PTL.reports.currentRowIsEven) {
        return 'even';
      } else {
        return 'odd';
      }
    },

    resetRowStyle: function () {
      PTL.reports.currentRowIsEven = false;
    }

  };

})(jQuery);

$(function ($) {
  PTL.reports.init();
});