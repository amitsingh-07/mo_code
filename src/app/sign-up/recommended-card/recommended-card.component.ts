import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SlickCarouselComponent } from 'ngx-slick-carousel';
import { RecommendedCardModalComponent } from '../recommended-card-modal/recommended-card-modal.component';
import { SignUpApiService } from '../sign-up.api.service';
import { SIGN_UP_CONFIG } from '../sign-up.constant';

@Component({
  selector: 'app-recommended-card',
  templateUrl: './recommended-card.component.html',
  styleUrls: ['./recommended-card.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RecommendedCardComponent implements OnInit {

  cards = [];
  slideConfig = {
    slidesToShow: SIGN_UP_CONFIG.RECOMMENDED_CARD.CAROUSEL_CONFIG.SLIDES_TO_SHOW_DESKTOP,
    slidesToScroll: SIGN_UP_CONFIG.RECOMMENDED_CARD.CAROUSEL_CONFIG.DESKTOP_SLIDES_TO_SCROLL,
    nextArrow: '<div class="next-arrow circle"><img src="assets/images/carousel-arrow-icon.svg" alt="" /></div>',
    prevArrow: '<div class="prev-arrow circle"><img src="assets/images/carousel-arrow-icon.svg" alt="" /></div>',
    autoplay: false,
    dots: false,
    infinite: false,
    variableWidth: true,
    draggable: false,
    responsive: [
      {
        breakpoint: SIGN_UP_CONFIG.RECOMMENDED_CARD.CAROUSEL_CONFIG.SCREEN_SIZE,
        settings: {
          slidesToShow: SIGN_UP_CONFIG.RECOMMENDED_CARD.CAROUSEL_CONFIG.SLIDES_TO_SHOW_MOB,
          slidesToScroll: SIGN_UP_CONFIG.RECOMMENDED_CARD.CAROUSEL_CONFIG.MOBILE_SLIDES_TO_SCROLL
        }
      },
    ]
  };
  currentSlide = 0;
  @ViewChild('carousel') carousel: SlickCarouselComponent;
  iconSrcPath = SIGN_UP_CONFIG.RECOMMENDED_CARD.ICONS_PATH;
  isLoadComplete = false;
  isCardDsmissed = false;
  cardEvent: any;
  email: string = '';
  isEmailSent: boolean = false;
  constructor(
    public modal: NgbModal,
    private signUpApiService: SignUpApiService,
    private readonly translate: TranslateService
  ) {
    this.translate.use('en');
  }

  ngOnInit(): void {
    this.getRecommendedCards();
    this.getEmail();
  }

  // Setting the next slide index on beforeChange event fire
  getEmail(){
    if(window.sessionStorage){
      this.email = sessionStorage.getItem('email');
      console.log(this.email);
    }
  }
  beforeSlideChange(e) {
    this.currentSlide = e.nextSlide;
  }

  openCard(cardId) {
    // Based on card id, make API call to get Card Content
    this.signUpApiService.getCardById(cardId).subscribe((resp: any) => {
      const ref = this.modal.open(RecommendedCardModalComponent, {
        centered: true,
        windowClass: 'recommended-card-modal',
        backdrop: 'static',
        keyboard: false
      });
      ref.componentInstance.cardContent = resp.objectList; // Pass card content here
      //??
      ref.componentInstance.closeAction.subscribe((value: any) => {
        this.isLoadComplete = false;
        if (value) {
          // Dismiss API call goes here
          this.signUpApiService.dismissCard(cardId).subscribe(dismissResp => {
            this.isCardDsmissed = true;
            this.getRecommendedCards();
          });
        } else {
          this.getRecommendedCards();
        }
      });

      ref.componentInstance.resendEmail.subscribe((value: boolean) =>{
        this.signUpApiService.resendEmailVerification(this.email, value).subscribe( (data) =>{
          if(data.responseMessage.responseCode==6007){
            ref.componentInstance.emailSent = true;
          }
        })
      })
    }, err => {

    })
  }

  getIcon(iconId) {
    return `${this.iconSrcPath}${iconId}`;
  }

  getRecommendedCards() {
    // API CALL GOES HERE
    this.signUpApiService.getCardsByPageSizeAndNo(SIGN_UP_CONFIG.RECOMMENDED_CARD.PAGE_SIZE, SIGN_UP_CONFIG.RECOMMENDED_CARD.PAGE_COUNT).subscribe((resp: any) => {
      this.isLoadComplete = true;
      const responseCode = resp && resp.responseMessage && resp.responseMessage.responseCode ? resp.responseMessage.responseCode : 0;
      if (responseCode >= 6000) {
        this.cards = resp.objectList.pageList;
        if (this.isCardDsmissed && this.cardEvent) {
          if (window.innerWidth < SIGN_UP_CONFIG.RECOMMENDED_CARD.CAROUSEL_CONFIG.SCREEN_SIZE && this.cards.length != SIGN_UP_CONFIG.RECOMMENDED_CARD.PAGE_COUNT && this.cards.length > 0) {
            this.carousel.unslick();
            setTimeout(() => {
              const slideToShow = this.cardEvent.currentSlide == this.cards.length ? this.cardEvent.currentSlide - 1 : this.cardEvent.currentSlide;
              if (!this.carousel.initialized) {
                this.carousel.initSlick();
              }
              this.carousel.slickGoTo(slideToShow);
              this.isCardDsmissed = false;
            });
          } else {
            setTimeout(() => {
              //??
              const getSlides = (document.getElementsByClassName('slick-current') as any);
              //??
              const getCurrentSlideIndex = getSlides && getSlides.length > 0 ? getSlides[0].getAttribute('data-slick-index') : '-1';
              //??
              this.cardEvent.currentSlide = Number(getCurrentSlideIndex) > -1 ? parseInt(getCurrentSlideIndex) : this.cardEvent.currentSlide - 1;
              this.afterSlideChange(this.cardEvent);
              this.isCardDsmissed = false;
            });
          }
        }
      }
    }, err => {
      this.isLoadComplete = true;
    });
  }

  afterSlideChange(event) {
    this.cardEvent = event;
    const nextArrow: any = document.getElementsByClassName('next-arrow');
    const prevArrow: any = document.getElementsByClassName('prev-arrow');
    if ((this.cards.length % 2 > 0 && event.currentSlide + 1 == this.cards.length) ||
      (this.cards.length % 2 <= 0 && !event.first)) {
      this.checkElement(nextArrow, 'none');
    } else {
      this.checkElement(nextArrow, 'inherit');
    }

    if (event.first) {
      this.checkElement(prevArrow, 'none');
    } else {
      this.checkElement(prevArrow, 'inherit');
    }
  }

  slickInit(e) {
    const prevArrow: any = document.getElementsByClassName('prev-arrow');
    this.checkElement(prevArrow, 'none');
  }

  trackCards(index, item) {
    return index;
  }

  checkElement(element, property) {
    if (element && element.length > 0) {
      element[0].style.display = property;
    }
  }
}
