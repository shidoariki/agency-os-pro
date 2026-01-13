'use server'

// app/actions.ts

export async function submitQuote(formData: any) {
  // Simulate network delay (The "Loading" state)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("Server received:", formData);

  // TODO:CONNECT SUPABASE
  // const { data, error } = await supabase.from('leads').insert([formData])

  // For now, return success
  return { success: true, message: "Quote sent! Check your email." };
}