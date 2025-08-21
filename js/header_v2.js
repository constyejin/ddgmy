  const sidebarBtn = document.querySelector('.sidebar_btn');
  const sidebar = document.querySelector('.sidebar');
  const closeBtn = document.querySelector('.close_btn');
  const ddd = document.getElementById('ddd');

  ddd.addEventListener('click', () => {
    console.log(3535)
  })

  console.log(sidebarBtn, sidebar, closeBtn)
  sidebarBtn.addEventListener('click', () => {
    console.log(123)
    sidebar.classList.add('is_active');
  })

  closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('is_active');
  })