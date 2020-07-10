/**
 * instajax v2
 */

!function(){

  var ready = function(callback) {
    if (document.readyState != "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  ready(function() {

    // defaults
    var templateId         = 'template-instajax';

    // get the template
    var template           = document.getElementById(templateId);

    if ( template ) {

      // extract the HTML and create a new element..
      var element = document.createElement('div');
      element.innerHTML = template.innerHTML;


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

                // var instaDesc = data.match(/<meta content="(.*?) -/)[1];
                var instaData = JSON.parse(data.match(/window\..sharedData = (.*?);<\/script>/)[1]);
                // var profilePic = instaData.entry_data.ProfilePage[0].graphql.user.profile_pic_url_hd;
                var images = instaData.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges

                // console.log( instaDesc );
                // console.log( profilePic );

                var maxImages = images.length;

                showImages = ( showImages <= maxImages ) ? showImages : maxImages;

                var itemsHTML = '';

                for (var i = 0; i < showImages; i++) {

                  var image = images[i];
                  var href  = '//instagram.com/p/' + image.node.shortcode;
                  var src   = image.node.thumbnail_src;

                  if ( element.querySelector('#instajax-item-'+i) ) {

                    // do this in place, as it only happens once..
                    var fragment = element.querySelector('#instajax-item-'+i);
                    fragment.innerHTML = fragment.innerHTML
                      .replace(/{{index}}/g, i)
                      .replace(/{{href}}/g, href)
                      .replace(/{{src}}/g, src)
                      .replace(/{{index1}}/g, i+1);
                  }
                  else if ( element.querySelector('#instajax-items') ) {

                    // need to store this and append each time..
                    itemsHTML += element.querySelector('#instajax-items').innerHTML
                      .replace(/{{index}}/g, i)
                      .replace(/{{href}}/g, href)
                      .replace(/{{src}}/g, src)
                      .replace(/{{index1}}/g, i+1);
                  }
                }

                // replace the contents of our template elements..
                element.querySelector('#instajax-items').innerHTML = itemsHTML;

                // copy this into the dom..
                instaContainer.innerHTML = element.innerHTML;

                // save in the cache..
                window.localStorage.setItem('instajax', element.innerHTML);
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
