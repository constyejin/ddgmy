const list = document.querySelector(".partner_list");

list.innerHTML += list.innerHTML + list.innerHTML;

const listWidth = list.scrollWidth / 3;

gsap.to(list, {
  x: -listWidth,        
  duration: 50,
  ease: "none",
  repeat: -1,
  modifiers: {
    x: gsap.utils.unitize(x => {
      let pos = parseFloat(x);
      if (pos <= -listWidth) {
        pos += listWidth; 
      }
      return pos;
    })
  }
});
