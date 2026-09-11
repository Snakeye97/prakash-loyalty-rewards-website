const sb=window.supabase.createClient(window.PRAKSH_SUPABASE_URL,window.PRAKSH_SUPABASE_KEY);
let customerSession=null;
function friendlyError(x){return x?.name==='TypeError'?'Unable to connect to the loyalty service. Please try again.':(x?.message||'Something went wrong. Please try again.')}
const CUSTOMER_API=`${window.PRAKSH_SUPABASE_URL}/functions/v1/customer-api`;
async function customerApi(action,body){
 const headers={'Content-Type':'application/json','apikey':window.PRAKSH_SUPABASE_KEY};
 headers.Authorization=`Bearer ${customerSession||window.PRAKSH_SUPABASE_KEY}`;
 const r=await fetch(CUSTOMER_API,{method:'POST',headers,body:JSON.stringify({action,...body})});
 let data;try{data=await r.json()}catch{throw Error('Server returned an invalid response.')}
 if(!r.ok||!data?.ok)throw Error(data?.error||'Unable to connect to the loyalty service. Please try again.');
 return data;
}
async function loginCustomer(){
 const name=$('name').value.trim(),phone=$('phone').value.replace(/\D/g,'');
 if(phone.length!==10)throw Error('Enter a valid 10-digit mobile number.');
 if(name.length<2)throw Error('Enter your name.');
 const data=await customerApi('login',{name,phone});
 customerSession=data.session;sessionStorage.setItem('praksh-customer-session',customerSession);customer=data.customer;renderCustomer(customer);$('customerMsg').textContent='';
}
function renderCustomer(c){const rewardValue=Math.floor(Number(c.available||0)/10)*10;$('available').parentElement.firstChild.textContent=`Available reward value (₹${rewardValue})`;$('available').textContent=c.available;$('earned').textContent=c.earned;$('redeemed').textContent=c.redeemed;$('pending').textContent=c.pending;$('dashboard').classList.remove('hidden');$('ledger').innerHTML=(c.bills||[]).map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.bill)}</td><td>${money(x.amount)}</td><td>${esc(x.points)}</td><td><span class="status ${esc(x.status).toLowerCase()}">${esc(x.status)}</span></td><td>${esc(x.reason||'-')}</td></tr>`).join('')||'<tr><td colspan="6">No bills yet.</td></tr>'}
let customer=null;
$('pin')?.remove();
$('customerForm').onsubmit=async e=>{e.preventDefault();showMsg($('customerMsg'),'Loading...');try{await loginCustomer()}catch(x){showMsg($('customerMsg'),friendlyError(x),true)}};
$('billForm').onsubmit=async e=>{e.preventDefault();showMsg($('billMsg'),'Uploading...');try{const amount=Number($('amount').value),file=$('photo').files[0],bill=$('bill').value.trim(),date=$('date').value;if(!Number.isFinite(amount)||amount<100)throw Error('Minimum bill amount is ₹100.');if(!bill)throw Error('Enter the bill number.');if(!file)throw Error('Select the bill photo.');if(file.size>10*1024*1024)throw Error('Bill photo must be under 10 MB.');if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Use a JPG, PNG or WebP bill photo.');if(!date||date>localDate())throw Error('Purchase date cannot be in the future.');const form=new FormData();form.append('action','submit_bill');form.append('bill_number',bill);form.append('amount',String(amount));form.append('purchase_date',date);form.append('photo',file);const headers={'apikey':window.PRAKSH_SUPABASE_KEY,'Authorization':`Bearer ${customerSession}`};const r=await fetch(CUSTOMER_API,{method:'POST',headers,body:form});const data=await r.json();if(!r.ok||!data?.ok)throw Error(data?.error||'Submission failed.');showMsg($('billMsg'),'Bill submitted. Waiting for owner approval.');e.target.reset();$('date').value=localDate();await refreshCustomer()}catch(x){showMsg($('billMsg'),friendlyError(x),true)}};
const redeemPoints=document.createElement('input');redeemPoints.id='redeemPoints';redeemPoints.type='number';redeemPoints.min='100';redeemPoints.step='10';redeemPoints.value='100';redeemPoints.placeholder='Points to redeem';const redeemBill=document.createElement('input');redeemBill.id='redeemBill';redeemBill.type='text';redeemBill.placeholder='New redemption bill number';$('redeem').before(redeemBill,redeemPoints);
$('redeem').onclick=async()=>{showMsg($('redeemMsg'),'Submitting...');try{const points=Number(redeemPoints.value),billNumber=redeemBill.value.trim();if(!Number.isInteger(points)||points<100||points%10!==0)throw Error('Enter a minimum of 100 points in multiples of 10.');if(!billNumber)throw Error('Enter the bill number used for this redemption.');const data=await customerApi('redeem',{points,bill_number:billNumber});showMsg($('redeemMsg'),data.message);await refreshCustomer()}catch(x){showMsg($('redeemMsg'),friendlyError(x),true)}};
async function refreshCustomer(){const data=await customerApi('data',{});customer=data.customer;renderCustomer(customer)}
$('customerLogout').onclick=()=>{customer=null;customerSession=null;sessionStorage.removeItem('praksh-customer-session');$('dashboard').classList.add('hidden');$('customerForm').reset();showMsg($('customerMsg'),'Logged out.')};
$('redeem').textContent='Redeem Selected Reward';redeemPoints.previousElementSibling.textContent='Enter at least 100 points in multiples of 10. Each point equals ₹1.';
$('theme').onclick=toggleTheme;$('date').value=localDate();
(async()=>{const s=sessionStorage.getItem('praksh-customer-session');if(!s)return;customerSession=s;try{await refreshCustomer()}catch{customerSession=null;sessionStorage.removeItem('praksh-customer-session')}})();
