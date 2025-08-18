const items = document.querySelectorAll('.ddg_value_item');
const buttons = document.querySelectorAll('.ddg_value_btn_list li');

buttons.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    buttons.forEach(b => b.classList.remove('is_active'));
    items.forEach(item => item.classList.remove('is_active'));

    btn.classList.add('is_active');
    items[i].classList.add('is_active');
  });
});
