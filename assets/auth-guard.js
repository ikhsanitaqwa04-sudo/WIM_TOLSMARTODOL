(function(){
  document.body.classList.add('auth-checking');
  const LOGIN='login.html';
  function goLogin(){ if(!location.pathname.endsWith('/'+LOGIN) && !location.pathname.endsWith(LOGIN)) location.replace(LOGIN); }
  function setupError(message){
    document.body.classList.remove('auth-checking');
    document.body.innerHTML='<main style="max-width:720px;margin:12vh auto;padding:28px;font:16px Arial;color:#17324d"><h1>TOLSMART-ODOL belum dikonfigurasi</h1><p>'+message+'</p><p>Buka <b>assets/supabase-config.js</b>, isi Project URL dan anon/publishable key dari Supabase, lalu jalankan SQL pada <b>supabase/schema.sql</b>.</p><a href="login.html">Buka halaman login</a></main>';
  }
  async function start(){
    const url=window.TOLSMART_SUPABASE_URL, key=window.TOLSMART_SUPABASE_ANON_KEY;
    if(!window.supabase || !url || !key || url.includes('YOUR-PROJECT') || key.includes('YOUR_SUPABASE')){setupError('Hubungkan proyek Supabase terlebih dahulu.');return;}
    const client=window.supabase.createClient(url,key);
    window.tolsmartAuth=client;
    const {data:{session},error}=await client.auth.getSession();
    if(error || !session){goLogin();return;}
    const {data:profile,error:profileError}=await client.from('profiles').select('full_name,role,approval_status').eq('id',session.user.id).maybeSingle();
    if(profileError || !profile || profile.approval_status!=='approved'){
      await client.auth.signOut();
      setupError('Akun belum mendapat persetujuan atau profil belum tersedia. Hubungi administrator TOLSMART-ODOL.');
      return;
    }
    const roles={admin:'ADMINISTRATOR',operator:'PETUGAS / OPERATOR',observer:'PENGAMAT'};
    const roleEl=document.getElementById('authRoleLabel'),emailEl=document.getElementById('authUserEmail'),logout=document.getElementById('logoutButton');
    if(roleEl)roleEl.textContent=roles[profile.role]||'PENGGUNA';
    if(emailEl)emailEl.textContent=profile.full_name||session.user.email;
    if(logout)logout.addEventListener('click',async()=>{await client.auth.signOut();location.replace(LOGIN);});
    // Observer mendapat tampilan baca-saja: sembunyikan kontrol yang mengubah data atau menjalankan simulasi.
    if(profile.role==='observer'){
      document.querySelectorAll('[data-write-action],.write-action').forEach(el=>el.hidden=true);
      document.querySelectorAll('button:not(#logoutButton), input, select, textarea').forEach(el=>{el.disabled=true;el.setAttribute('aria-disabled','true');});
      const note=document.createElement('div');
      note.style.cssText='margin:10px auto;max-width:1200px;padding:10px 14px;background:#eaf4ff;border:1px solid #b7d8f5;border-radius:9px;color:#17466d;font:12px Arial';
      note.textContent='Mode pengamat: akses baca-saja. Fitur pengubahan data dan pengoperasian simulasi dibatasi.';
      document.querySelector('main')?.prepend(note);
    }
    document.body.classList.remove('auth-checking');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();