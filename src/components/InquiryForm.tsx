import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateInquiry } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone number required"),
  message: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface InquiryFormProps {
  projectId?: string;
  plotId?: string;
  title?: string;
}

export default function InquiryForm({ projectId, plotId, title = "Send Inquiry" }: InquiryFormProps) {
  const { toast } = useToast();
  const createInquiry = useCreateInquiry();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    createInquiry.mutate(
      { data: { ...data, projectId: projectId ?? null, plotId: plotId ?? null } },
      {
        onSuccess: () => {
          toast({ title: "Inquiry Submitted", description: "We will contact you shortly." });
          reset();
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to submit inquiry.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input {...register("name")} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Your full name" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
          <input {...register("email")} type="email" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="your@email.com" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
          <input {...register("phone")} type="tel" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="+92 300-0000000" />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea {...register("message")} rows={3} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" placeholder="Tell us what you are looking for..." />
        </div>
        <button
          type="submit"
          disabled={createInquiry.isPending}
          className="w-full bg-red-600 text-white py-2.5 rounded font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {createInquiry.isPending ? "Sending..." : "Send Inquiry"}
        </button>
        <p className="text-xs text-gray-500 text-center">We typically respond within 2 hours during business hours.</p>
      </form>
    </div>
  );
}
