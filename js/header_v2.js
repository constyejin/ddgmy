  const sidebarBtn = document.querySelector('.sidebar_btn');
  const sidebar = document.querySelector('.sidebar');
  const closeBtn = document.querySelector('.close_btn');

  console.log(sidebarBtn, sidebar, closeBtn)
  sidebarBtn.addEventListener('click', () => {
    sidebar.classList.add('is_active');
  })

  closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('is_active');
  })