/**
 * instajax v1
 */

!function(){

  // dom ready helper..
  var ready = function(callback) {

    if (document.readyState != "loading") {

      callback();

    } else {

      document.addEventListener("DOMContentLoaded", callback);

    }
  }

  ready(function() {

    // defaults
    var templateFirstId = 'template-instajax-item-first';
    var templateId      = 'template-instajax-item';

    // get the templates
    var templateFirst = document.getElementById(templateFirstId);
    var template      = document.getElementById(templateId);

    if ( template ) {

      // expand the data variables / set defaults..
      var instaContainer = template.dataset.instajaxContainerId ? document.getElementById(template.dataset.instajaxContainerId) : '';
      var handle         = template.dataset.instajaxHandle      ? template.dataset.instajaxHandle                               : '';
      var showImages     = template.dataset.instajaxShowImages  ? parseInt(template.dataset.instajaxShowImages)                 : 4;
      var interval       = template.dataset.instajaxInterval    ? parseInt(template.dataset.instajaxInterval)                   : 21600; //6hs

      if ( instaContainer && handle ) {

        var ts = Math.round((new Date()).getTime() / 1000);
        var instajaxStore = window.localStorage.getItem('instajax');
        var instajaxTS = window.localStorage.getItem('instajaxTS');

        if ( instajaxStore && instajaxTS && ts < ( parseInt(instajaxTS) + interval ) ) {

          instaContainer.innerHTML = instajaxStore;

        } else {

          var request = new XMLHttpRequest();
          request.open('GET', 'https://www.instagram.com/'+ handle +'/', true);

          request.onload = function() {

            if (this.status >= 200 && this.status < 400) {

              // Success!
              var data = this.response;
              try {

                var instaHTML = '';

                // var instaDesc = data.match(/<meta content="(.*?) -/)[1];
                var instaData = JSON.parse(data.match(/window\..sharedData = (.*?);<\/script>/)[1]);
                // var profilePic = instaData.entry_data.ProfilePage[0].graphql.user.profile_pic_url_hd;
                var images = instaData.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges

                // console.log( instaDesc );
                // console.log( profilePic );

                var maxImages = images.length;

                showImages = ( showImages <= maxImages ) ? showImages : maxImages;

                for (var i = 0; i < showImages; i++) {

                  // Do we also have a first image template?
                  if ( templateFirst && i < 1 ) {

                    // get the contents of the first template..
                    var templateHTML = templateFirst.innerHTML;

                  } else {

                    // get the contents of the template..
                    var templateHTML = template.innerHTML;

                  }

                  var image = images[i];
                  var href  = '//instagram.com/p/' + image.node.shortcode;
                  var src   = image.node.thumbnail_src;

                  instaHTML += templateHTML
                    .replace(/{{index}}/g, i)
                    .replace(/{{href}}/g, href)
                    .replace(/{{src}}/g, src)
                    .replace(/{{index1}}/g, i+1);

                }

                instaContainer.innerHTML = instaHTML;
                window.localStorage.setItem('instajax', instaHTML);
                window.localStorage.setItem('instajaxTS', ts);

              } catch (error) {

                console.error(error);

              }

            } else {

              // We reached our target server, but it returned an error
              console.error('data error');

            }
          };

          request.onerror = function() {

            // There was a connection error of some sort
            console.error('connection error');

          };

          request.send();
        }
      }
    }

  });
}();
