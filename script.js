let count = 0;
const countDisplay = document.getElementById('count');
const button = document.getElementById('btn');

button.addEventListener('click', function() {
  count++;
  countDisplay.textContent = count;
  alert(`You clicked ${count} times! JavaScript is live 🚀`);
});
