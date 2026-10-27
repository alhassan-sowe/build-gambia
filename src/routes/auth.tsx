import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/use-auth';
import { authSchema } from '@/lib/pilot-validation';
import { pageHead } from '@/lib/route-meta';
export const Route=createFileRoute('/auth')({head:()=>pageHead('Sign in','Sign in or create a buyer or supplier account for Envora.'),component:AuthPage});
function AuthPage(){
 const auth=useAuth();const navigate=useNavigate();const [mode,setMode]=useState('login');const [role,setRole]=useState('buyer');const [name,setName]=useState('');const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 useEffect(()=>{if(auth.profile && !auth.loading)void navigate({to:auth.profile.role==='admin'?'/admin':auth.profile.role==='supplier'||sessionStorage.getItem('envora-supplier-intent')==='yes'?'/supplier':'/dashboard',replace:true});},[auth.profile,auth.loading,navigate]);
 async function submit(e:React.FormEvent){e.preventDefault();setMessage('');setBusy(true);try {
  const values=authSchema.safeParse({email,password});if(!values.success){setMessage('Enter a valid email and a password of at least 8 characters.');return;}
  if(mode==='register'){
   if(!name.trim()){setMessage('Enter your name.');return;}
   if(role==='supplier')sessionStorage.setItem('envora-supplier-intent','yes');else sessionStorage.removeItem('envora-supplier-intent');
   const {data,error}=await supabase.auth.signUp({...values.data,options:{emailRedirectTo:window.location.origin,data:{name:name.trim()}}});
   if(error){setMessage(error.code==='user_already_exists'?'An account already exists. Sign in instead.':'Could not create your account. Please retry later.');return;}
   setMessage(data.session?'Account created. Loading your account…':'Check your email to confirm your account, then sign in. Supplier business details are completed after sign-in.');
  }else {const {error}=await supabase.auth.signInWithPassword(values.data);if(error){setMessage('Sign-in failed. Check your email, password and email confirmation.');return;}await auth.refresh();}
 }catch{setMessage('Connection failed. Please retry.');}finally{setBusy(false);}}
 return <div className="min-h-screen grid md:grid-cols-2 bg-background"><div className="hidden md:flex bg-surface text-surface-foreground p-12 flex-col justify-between"><Link to="/" className="font-extrabold text-2xl">Envora</Link><div><h1 className="text-4xl font-bold">Construction materials in The Gambia.</h1><p className="mt-4">Request quotes from approved suppliers.</p></div><span>Envora</span></div><div className="p-6 md:p-12 flex flex-col justify-center"><div className="w-full max-w-md mx-auto"><Link to="/" className="text-sm text-muted-foreground">Back to Envora</Link><h2 className="text-2xl font-bold mt-6">Welcome to Envora</h2><Tabs value={mode} onValueChange={v=>{setMode(v);setMessage('');}} className="mt-6"><TabsList className="grid grid-cols-2 w-full"><TabsTrigger value="login">Log In</TabsTrigger><TabsTrigger value="register">Create Account</TabsTrigger></TabsList></Tabs><form onSubmit={submit} className="space-y-4 mt-5">{mode==='register'&&<><Label htmlFor="name">Full name</Label><Input id="name" required maxLength={100} value={name} onChange={e=>setName(e.target.value)}/><Label>Account type</Label><RadioGroup value={role} onValueChange={setRole} className="flex gap-6"><label className="flex gap-2"><RadioGroupItem value="buyer"/>Buyer</label><label className="flex gap-2"><RadioGroupItem value="supplier"/>Supplier</label></RadioGroup></>}<div><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" required maxLength={255} value={email} onChange={e=>setEmail(e.target.value)}/></div><div><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete={mode==='register'?'new-password':'current-password'} required minLength={mode==='register'?8:1} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)}/></div><Button type="submit" className="w-full" disabled={busy||auth.loading}>{busy?'Please wait…':mode==='register'?'Create Account':'Log In'}</Button>{message&&<p role="status" className="text-sm">{message}</p>}{auth.error&&<div role="alert"><p>{auth.error}</p><Button type="button" variant="outline" onClick={()=>void auth.refresh()}>Retry account loading</Button></div>}</form></div></div></div>;
}
