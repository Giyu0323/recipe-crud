const API = '/api/recipes';

const form = document.getElementById('recipe-form');
const list = document.getElementById('recipe-list');
const saveBtn = document.getElementById('save-btn');
const cancelBtn = document.getElementById('cancel-btn');
const fields = ['title', 'category', 'ingredients', 'instructions', 'prep_time_minutes', 'servings'];

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function loadRecipes() {
  const res = await fetch(API);
  const recipes = await res.json();
  list.innerHTML = recipes.map((r) => `
    <tr>
      <td>${r.id}</td>
      <td>${esc(r.title)}</td>
      <td>${esc(r.category)}</td>
      <td>${esc(r.ingredients)}</td>
      <td>${esc(r.prep_time_minutes)}</td>
      <td>${esc(r.servings)}</td>
      <td class="actions">
        <button onclick="editRecipe(${r.id})">Edit</button>
        <button onclick="deleteRecipe(${r.id})">Delete</button>
      </td>
    </tr>`).join('');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('recipe-id').value;
  const body = {};
  fields.forEach((f) => {
    const v = document.getElementById(f).value.trim();
    body[f] = v === '' ? null : v;
  });

  const res = await fetch(id ? `${API}/${id}` : API, {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    return alert(err.error || 'Something went wrong');
  }
  resetForm();
  loadRecipes();
});

async function editRecipe(id) {
  const res = await fetch(`${API}/${id}`);
  const r = await res.json();
  document.getElementById('recipe-id').value = r.id;
  fields.forEach((f) => (document.getElementById(f).value = r[f] ?? ''));
  saveBtn.textContent = 'Update Recipe';
  cancelBtn.style.display = 'inline';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteRecipe(id) {
  if (!confirm('Delete this recipe?')) return;
  await fetch(`${API}/${id}`, { method: 'DELETE' });
  loadRecipes();
}

function resetForm() {
  form.reset();
  document.getElementById('recipe-id').value = '';
  saveBtn.textContent = 'Add Recipe';
  cancelBtn.style.display = 'none';
}

cancelBtn.addEventListener('click', resetForm);
loadRecipes();