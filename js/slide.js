import debounce from "./debounce.js";

export class Slide {
  constructor(slide, slideWrapper) {
    this.slide = document.querySelector(slide);
    this.slideWrapper = document.querySelector(slideWrapper);
    this.dist = {
      finalPosition: 0,
      startX: 0,
      movement: 0,
    };

    this.activeClass = "active";

    this.chengeEvent = new Event("chengeEvent");
  }

  transitionSlide(active) {
    this.slide.style.transition = active ? "transform .3s" : "";
  }

  moveSlide(distX) {
    this.dist.movePosition = distX;
    this.slide.style.transform = `translate3d(${distX}px,0,0)`;
  }

  updatePosition(clientX) {
    this.dist.movement = (this.dist.startX - clientX) * 1.6;
    return this.dist.finalPosition - this.dist.movement;
  }

  onStart(event) {
    let movetype;
    if (event.type === "mousedown") {
      event.preventDefault();
      this.dist.startX = event.clientX;
      movetype = "mousemove";
    } else {
      this.dist.startX = event.changedTouches[0].clientX;
      movetype = "touchmove";
    }
    this.slideWrapper.addEventListener(movetype, this.onMove);
    this.transitionSlide(false);
  }

  onMove(event) {
    const pointerPosition =
      event.type === "mousemove"
        ? event.clientX
        : event.changedTouches[0].clientX;
    const finalPosition = this.updatePosition(pointerPosition);
    this.moveSlide(finalPosition);
  }

  onEnd(event) {
    const movetype = event.type === "mouseup" ? "mousemove" : "touchmove";
    this.slideWrapper.removeEventListener(movetype, this.onMove);
    this.dist.finalPosition = this.dist.movePosition;
    this.transitionSlide(true);
    this.changeSlideOnEnd();
  }

  changeSlideOnEnd() {
    if (this.dist.movement > 120 && this.dist.movement !== undefined) {
      this.activeNextSlide();
    } else if (this.dist.movement < -120 && this.dist.movement !== undefined) {
      this.activePrevSlide();
    }
    this.changeSlide(this.index.active);
  }

  addSlideEvents() {
    this.slideWrapper.addEventListener("mousedown", this.onStart);
    this.slideWrapper.addEventListener("touchstart", this.onStart);
    this.slideWrapper.addEventListener("mouseup", this.onEnd);
    this.slideWrapper.addEventListener("touchend", this.onEnd);
  }

  // slide-config

  slidePosition(slide) {
    const margin = (this.slideWrapper.offsetWidth - slide.offsetWidth) / 2;

    return -(slide.offsetLeft - margin);
  }

  slideConfig() {
    this.slideArray = [...this.slide.children].map((element) => {
      const position = this.slidePosition(element);
      return { element, position };
    });
  }

  slideIndexNav(index) {
    const last = this.slideArray.length - 1;
    this.index = {
      prev: index ? index - 1 : undefined,
      active: index,
      next: index === last ? undefined : index + 1,
    };
  }

  changeSlide(index) {
    const activeSlide = this.slideArray[index];
    this.moveSlide(activeSlide.position);
    this.slideIndexNav(index);
    this.dist.finalPosition = activeSlide.position;
    this.changeActiveClass();
    this.slideWrapper.dispatchEvent(this.chengeEvent);
  }

  changeActiveClass() {
    this.slideArray.forEach((item) =>
      item.element.classList.remove(this.activeClass)
    );
    this.slideArray[this.index.active].element.classList.add(this.activeClass);
  }

  activePrevSlide() {
    if (this.index.prev !== undefined) {
      this.changeSlide(this.index.prev);
    }
  }
  activeNextSlide() {
    if (this.index.next !== undefined) {
      this.changeSlide(this.index.next);
    }
  }

  addRisizeEvent() {
    window.addEventListener("resize", this.onRisize);
  }

  onRisize() {
    setTimeout(() => {
      this.slideConfig();
      this.changeSlide(this.index.active);
    }, 1000);
  }

  bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);

    this.activePrevSlide = this.activePrevSlide.bind(this);
    this.activeNextSlide = this.activeNextSlide.bind(this);
    this.onRisize = debounce(this.onRisize.bind(this), 200);
  }

  init() {
    this.bindEvents();
    this.transitionSlide(true);
    this.addSlideEvents();
    this.slideConfig();
    this.addRisizeEvent();
    this.changeSlide(0);
    return this;
  }
}

export default class SlideNav extends Slide {
  constructor(slide, slideWrapper) {
    super(slide, slideWrapper);
    this.bindControlEvents();
  }
  addArrow(prev, next) {
    this.prevElement = document.querySelector(prev);
    this.nextElement = document.querySelector(next);
    this.addArrowEvent();
  }

  addArrowEvent() {
    this.prevElement.addEventListener("click", this.activePrevSlide);
    this.nextElement.addEventListener("click", this.activeNextSlide);
  }

  createControl() {
    const control = document.createElement("ul");
    control.dataset.control = "slide";
    this.slideArray.forEach((item, index) => {
      control.innerHTML += `<li><a href="#slide${index + 1}">${
        index + 1
      }</a></li>`;
    });
    this.slideWrapper.appendChild(control);
    return control;
  }

  eventControl(item, index) {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      this.changeSlide(index);
    });
    this.slideWrapper.addEventListener("chengeEvent", this.activeControlItem);
  }

  activeControlItem() {
    this.controlArray.forEach((item) => {
      item.classList.remove(this.activeClass);
    });
    this.controlArray[this.index.active].classList.add(this.activeClass);
  }

  addControl(customControl) {
    this.control =
      document.querySelector(customControl) || this.createControl();
    this.controlArray = [...this.control.children];
    this.activeControlItem();
    this.controlArray.forEach(this.eventControl);
  }

  bindControlEvents() {
    this.eventControl = this.eventControl.bind(this);
    this.activeControlItem = this.activeControlItem.bind(this);
  }
}
