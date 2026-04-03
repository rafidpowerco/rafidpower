import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface QuoteDialogProps {
  productTitle?: string;
  triggerChild?: React.ReactNode;
}

export default function QuoteDialog({ productTitle, triggerChild }: QuoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      product: productTitle || formData.get('product'),
      message: formData.get('message'),
    };

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log('Quote Request:', data);
    toast.success('تم إرسال طلب عرض السعر بنجاح! سنتواصل معك قريباً.');
    setLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerChild || (
          <Button className="bg-[#e63946] hover:bg-[#d62828] text-white">طلب عرض سعر</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-2xl font-bold text-[#1a3a52]">طلب عرض سعر</DialogTitle>
          <DialogDescription>
            {productTitle 
              ? `أدخل تفاصيلك للحصول على سعر خاص لـ: ${productTitle}`
              : 'أدخل تفاصيلك وسنقوم بالتواصل معك لتزويدك بعرض سعر مناسب.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">الاسم الكامل</label>
            <Input name="name" placeholder="أدخل اسمك" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">البريد الإلكتروني</label>
              <Input name="email" type="email" placeholder="email@example.com" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">رقم الهاتف</label>
              <Input name="phone" type="tel" placeholder="+964..." required />
            </div>
          </div>
          {!productTitle && (
            <div className="space-y-2">
              <label className="text-sm font-semibold">المنتج أو الخدمة المطلوبة</label>
              <Input name="product" placeholder="مثلاً: ميزان جسري 100 طن" required />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-semibold">تفاصيل إضافية</label>
            <Textarea name="message" placeholder="أدخل أي ملاحظات أو متطلبات خاصة" className="min-h-24" />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#1a3a52] hover:bg-[#2d5a7b] text-white font-bold h-12"
            disabled={loading}
          >
            {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
