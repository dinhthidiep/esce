const startInput = document.getElementById('START_DATE');
const endInput = document.getElementById('END_DATE');
const today = new Date();
const y = today.getFullYear();
const m = String(today.getMonth()+1).padStart(2,'0');
const d = String(today.getDate()).padStart(2,'0');
const todayStr = `${y}-${m}-${d}`;
startInput.min = todayStr;
endInput.min = todayStr;


const imageInput = document.getElementById('IMAGE');
const imgPreview = document.getElementById('imgPreview');
imageInput.addEventListener('change', e => {
const file = e.target.files[0];
if (!file) { imgPreview.style.display='none'; return }
if (!file.type.startsWith('image/')) { imgPreview.style.display='none'; return }
const reader = new FileReader();
reader.onload = ev => { imgPreview.src = ev.target.result; imgPreview.style.display='block' }
reader.readAsDataURL(file);
});


const form = document.getElementById('createTourForm');


function setError(id, message){ document.getElementById('err-'+id).textContent = message || '' }


form.addEventListener('submit', function(evt){
// xóa lỗi cũ
['name','address','description','price','START_DATE','END_DATE','capacity','available-slot','IMAGE'].forEach(id=>setError(id,''))


let ok = true;
const name = document.getElementById('name').value.trim();
const address = document.getElementById('address').value.trim();
const price = parseFloat(document.getElementById('price').value);
const capacity = parseInt(document.getElementById('capacity').value,10);
const available = parseInt(document.getElementById('available-slot').value,10);
const start = document.getElementById('START_DATE').value;
const end = document.getElementById('END_DATE').value;


if (!name){ setError('name','Tên tour không được để trống'); ok = false }
if (!address){ setError('address','Địa chỉ không được để trống'); ok = false }
if (isNaN(price) || price < 0){ setError('price','Giá phải là số >= 0'); ok = false }
if (isNaN(capacity) || capacity < 1){ setError('capacity','Sức chứa phải là số nguyên >= 1'); ok = false }
if (isNaN(available) || available < 0){ setError('available-slot','Số chỗ còn phải là số nguyên lớn hơn 0'); ok = false }
if (!start){ setError('START_DATE','Chọn ngày bắt đầu'); ok = false }
if (!end){ setError('END_DATE','Chọn ngày kết thúc'); ok = false }


if (!isNaN(capacity) && !isNaN(available) && available > capacity){ setError('available-slot','Số chỗ còn không thể lớn hơn sức chứa'); ok = false }


if (start && end){
const s = new Date(start);
const e = new Date(end);
if (s > e){ setError('END_DATE','Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.'); ok = false }
}


if (!ok){ evt.preventDefault(); window.scrollTo({top:0,behavior:'smooth'}); }
// nếu ok -> form sẽ submit tới endpoint /create-tour (server side cần xử lý lưu file ảnh và insert DB)
});


document.getElementById('resetBtn').addEventListener('click', ()=>{
form.reset();
imgPreview.style.display='none';
['name','address','description','price','START_DATE','END_DATE','capacity','available-slot','IMAGE'].forEach(id=>setError(id,''))
});