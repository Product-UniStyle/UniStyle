import { PageBanner } from '@/components/PageBanner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { faqs } from '@/data/legal';

export function FaqPage() {
  return (
    <div className="mt-[72px]">
      <PageBanner title="Frequently Asked Questions" />

      <div className="max-w-[860px] mx-auto px-6 lg:px-12 py-12 md:py-16">
        <Accordion type="single" collapsible className="border-t border-[#E5E5E5]">
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.question} value={`faq-${i}`} className="border-[#E5E5E5]">
              <AccordionTrigger className="py-5 text-left text-base font-semibold text-[#1A1A1A] hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-[#666] leading-relaxed pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
