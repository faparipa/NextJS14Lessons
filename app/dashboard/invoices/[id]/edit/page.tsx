//adatok szerkesztése
//app/ui/invoices/buttons.tsx => <Link  href={`/dashboard/invoices/${id}/edit`}>

import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCustomers, fetchInvoiceById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
 
export default async function Page({ params }: { params: { id: string } }) {
    const id = params.id;
    //You can use Promise.all to fetch both the invoice and customers in parallel:
    //Import fetchCustomers to fetch the customer names for the dropdown
    const [invoice, customers] = await Promise.all([
        fetchInvoiceById(id),
        fetchCustomers(),
      ]);

      //you can use a conditional to invoke notFound if the invoice doesn't exist:Create a not-found.tsx file inside the /edit folder.
      if (!invoice) {
        notFound();
      }
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form invoice={invoice} customers={customers} />
    </main>
  );
}