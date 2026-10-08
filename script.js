(() => {

  let titleText = " welcome to E'ship's home! -- learn more about us here ";
  let speed = 200; // smaller = faster

  function scrollTitle() {
    titleText = titleText.substring(1) + titleText[0];
    document.title = titleText;
  }
  setInterval(scrollTitle, speed);
  /* ==========================================
     CAROUSELS
  ========================================== */

  function initCarousels(){

    document
      .querySelectorAll('[data-carousel]')
      .forEach(carousel => {

        const slideCount =
          parseInt(carousel.dataset.slides, 10) || 3;

        const section =
          carousel.dataset.section;

        const viewport =
          carousel.querySelector('.carousel-viewport');

        const track =
          carousel.querySelector('.carousel-track');


        /* ------------------------------
           CREATE SLIDES
        ------------------------------ */

        for(let i = 0; i < slideCount; i++){

          const slide =
            document.createElement('div');

          slide.className =
            'carousel-slide';


          const img =
            document.createElement('img');


          /* ----------------------------------
             IMAGE SYSTEM

             section 1:
             images/section-1/1.jpg
             images/section-1/2.jpg
             images/section-1/3.jpg

             section 2:
             images/section-2/1.jpg
             etc.
          ---------------------------------- */

          img.src =
            `./images/section-${section}/${i + 1}.jpg`;


          /* ----------------------------------
             MATCH SLIDE TO REAL IMAGE RATIO
          ---------------------------------- */

          img.onload = function(){

            const trackHeight =
              track.clientHeight || 500;

            const ratio =
              this.naturalWidth /
              this.naturalHeight;

            slide.style.width =
              Math.round(
                trackHeight * ratio
              ) + 'px';
          };


          /* fallback if image doesn't exist */

          img.onerror = function(){

            this.onerror = null;

            this.src =
              './coming-soon-02.svg';

            this.classList.add(
              'placeholder-image'
            );
          };


          slide.appendChild(img);

          track.appendChild(slide);
        }



        /* ------------------------------
           DRAG TO SCROLL
        ------------------------------ */

        let isDown = false;

        let startX = 0;

        let startScroll = 0;


        viewport.addEventListener(
          'pointerdown',
          (e) => {

            if(e.pointerType !== 'mouse'){
              return;
            }

            isDown = true;

            startX =
              e.clientX;

            startScroll =
              viewport.scrollLeft;

            viewport.setPointerCapture(
              e.pointerId
            );

            viewport.classList.add(
              'dragging'
            );

            pauseAuto();
          }
        );


        viewport.addEventListener(
          'pointermove',
          (e) => {

            if(!isDown){
              return;
            }

            viewport.scrollLeft =
              startScroll -
              (e.clientX - startX);
          }
        );


        function endDrag(){

          if(!isDown){
            return;
          }

          isDown = false;

          viewport.classList.remove(
            'dragging'
          );

          scheduleResume();
        }


        viewport.addEventListener(
          'pointerup',
          endDrag
        );


        viewport.addEventListener(
          'pointercancel',
          endDrag
        );



        /* ------------------------------
           AUTO SCROLL
        ------------------------------ */

        let direction = 1;

        let paused = false;

        let resumeTimer;

        const SPEED = 0.4;



        function step(){

          if(!paused){

            const max =
              track.scrollWidth -
              viewport.clientWidth;

            if(max > 0){

              viewport.scrollLeft +=
                SPEED * direction;


              if(
                viewport.scrollLeft >= max
              ){

                viewport.scrollLeft =
                  max;

                direction = -1;
              }


              else if(
                viewport.scrollLeft <= 0
              ){

                viewport.scrollLeft =
                  0;

                direction = 1;
              }
            }
          }


          requestAnimationFrame(
            step
          );
        }


        requestAnimationFrame(
          step
        );


        function pauseAuto(){

          paused = true;

          clearTimeout(
            resumeTimer
          );
        }


        function scheduleResume(){

          clearTimeout(
            resumeTimer
          );

          resumeTimer =
            setTimeout(
              () => {

                paused = false;

              },
              1500
            );
        }



        viewport.addEventListener(
          'mouseenter',
          pauseAuto
        );


        viewport.addEventListener(
          'mouseleave',
          () => {

            if(!isDown){

              scheduleResume();

            }
          }
        );


        viewport.addEventListener(
          'touchstart',
          pauseAuto,
          {
            passive:true
          }
        );


        viewport.addEventListener(
          'touchend',
          scheduleResume
        );


        viewport.addEventListener(
          'wheel',
          () => {

            pauseAuto();

            scheduleResume();

          },
          {
            passive:true
          }
        );

      });

  }


  initCarousels();



  /* ==========================================
     CARD STACK
  ========================================== */

  const stack =
    document.getElementById('stack');


  const cards =
    Array.from(
      stack.querySelectorAll(
        '[data-card]'
      )
    );


  const cap =
    stack.querySelector(
      '.stack-cap'
    );


  const items =
    [...cards, cap];


  const REVEAL_GAP = 28;

  const CAP_BASE = 56;


  function peekHeight(){

    return window.matchMedia(
      '(max-width:760px)'
    ).matches

      ? 180

      : 220;

  }



  /* ==========================================
     LAYOUT
  ========================================== */

  function layout(){

    const peek =
      peekHeight();



    /* -----------------------------
       NORMAL STACKING
    ------------------------------ */

    items.forEach(
      (item, i) => {

        if(i === 0){

          item.style.marginTop = '';

          return;
        }


        const prev =
          items[i - 1];


        if(
          prev.classList.contains(
            'open'
          )
        ){

          item.style.marginTop =
            REVEAL_GAP + 'px';


          if(item === cap){

            cap.style.height =
              CAP_BASE + 'px';

          }

        }


        else {

          const overlap =
            Math.max(
              prev.offsetHeight -
              peek,
              0
            );


          item.style.marginTop =
            (-overlap) + 'px';


          if(item === cap){

            cap.style.height =
              (
                overlap +
                CAP_BASE
              ) + 'px';

          }

        }

      }
    );



    /* ==========================================
       HIDE COLLAPSED CARDS BEHIND LAST CARD
    ========================================== */

    const lastCard =
      cards[
        cards.length - 1
      ];


    if(
      lastCard &&
      lastCard.hasAttribute(
        'data-always-open'
      )
    ){

      /* start mask immediately
         after last card */

      cap.style.marginTop =
        '0px';


      const capTop =
        cap.offsetTop;


      let deepestClosedBottom =
        capTop;


      cards
        .slice(0, -1)
        .forEach(card => {

          if(
            !card.classList.contains(
              'open'
            )
          ){

            const cardBottom =
              card.offsetTop +
              card.offsetHeight;


            deepestClosedBottom =
              Math.max(
                deepestClosedBottom,
                cardBottom
              );

          }

        });


      const maskHeight =
        Math.max(
          deepestClosedBottom -
          capTop,
          0
        );


      cap.style.height =
        (
          CAP_BASE +
          maskHeight
        ) + 'px';

    }

  }



  /* ==========================================
     CARD CLICKING
  ========================================== */

  cards.forEach(card => {


    const head =
      card.querySelector(
        '.card-head'
      );


    const body =
      card.querySelector(
        '.card-body'
      );


    const alwaysOpen =
      card.hasAttribute(
        'data-always-open'
      );


    body.setAttribute(
      'aria-hidden',

      card.classList.contains(
        'open'
      )

        ? 'false'

        : 'true'

    );


    head.addEventListener(
      'click',
      () => {



        /* ------------------------------
           ALWAYS OPEN CARD
        ------------------------------ */

        if(alwaysOpen){

          layout();


          setTimeout(
            () => {

              card.scrollIntoView({

                behavior:'smooth',

                block:'start'

              });

            },

            60
          );


          return;

        }



        /* ------------------------------
           NORMAL CARDS
        ------------------------------ */

        const isOpen =
          card.classList.contains(
            'open'
          );



        /* close all normal cards */

        cards.forEach(c => {

          if(
            c.hasAttribute(
              'data-always-open'
            )
          ){

            return;

          }


          c.classList.remove(
            'open'
          );


          const cBody =
            c.querySelector(
              '.card-body'
            );


          cBody.setAttribute(
            'aria-hidden',
            'true'
          );

        });



        /* ------------------------------
           OPEN CLICKED CARD
        ------------------------------ */

        if(!isOpen){

          card.classList.add(
            'open'
          );


          body.setAttribute(
            'aria-hidden',
            'false'
          );


          layout();


          setTimeout(
            () => {

              card.scrollIntoView({

                behavior:'smooth',

                block:'start'

              });

            },

            60
          );


          return;

        }


        layout();

      }

    );

  });



  /* ==========================================
     RESIZE
  ========================================== */

  let resizeTimer;


  window.addEventListener(
    'resize',
    () => {

      clearTimeout(
        resizeTimer
      );


      resizeTimer =
        setTimeout(
          layout,
          120
        );

    }

  );



  /* ==========================================
     LOAD
  ========================================== */

  window.addEventListener(
    'load',
    layout
  );


  if(
    document.fonts &&
    document.fonts.ready
  ){

    document.fonts.ready.then(
      layout
    );

  }


  layout();


})();