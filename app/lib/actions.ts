'use server'

// Tip: If you're working with forms that have many fields, you may want to consider using the entries() method with JavaScript's Object.fromEntries(). For example:
// const rawFormData = Object.fromEntries(formData.entries())
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { z } from 'zod';
//amount is of type string and not number
 //validálja a form datat hogy megfelelő formában kerüljenek az adatbázisba
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
    errors?: {
      customerId?: string[];
      amount?: string[];
      status?: string[];
    };
    message?: string | null;
  };
  export async function createInvoice(prevState: State, formData: FormData) {
     // Validate form fields using Zod
    const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
   // If form validation fails, return errors early. Otherwise, continue.
   if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  //It's usually good practice to store monetary values in cents in your database to eliminate JavaScript floating-point errors and ensure greater accuracy
  const amountInCents = amount * 100;
  //dátum "YYYY-MM-DD" 
  const date = new Date().toISOString().split('T')[0];
//SQL query to insert the new invoice into your database
 try{
    await sql`
  INSERT INTO invoices (customer_id, amount, status, date)
  VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
`;
 } catch (error) {
    return {
        message: 'Database Error: Failed to Create Invoice.'
    }
 }

//revalidated, and fresh data 
revalidatePath('/dashboard/invoices');
//visszanavigál az invoices oldalra
redirect('/dashboard/invoices');
}


// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
 
// ...
 
export async function updateInvoice(
    id: string,
    prevState: State,
    formData: FormData,
  ) {
    const validatedFields = UpdateInvoice.safeParse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
   
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Update Invoice.',
      };
    }
   
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
 //a szerkesztett adatok frissítése 
 try{ 
     await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
 } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
 }
 
 //adatok frissítése
  revalidatePath('/dashboard/invoices');
  //visszanavigálás 
  redirect('/dashboard/invoices');
}

//delete
export async function deleteInvoice(id: string) {
    //próbáljuk ki mi van ha error lesz:
   // throw new Error('Failed to Delete Invoice');
    //...
   
    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
         //will trigger a new server request and re-render the table.
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice' };
    } catch (error) {
        return { message: 'Database Error: Failed to Delete Invoice.' };
    
    }
   
   
  }


import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
 
// ...
 
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}