import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { PageBanner } from '@/components/PageBanner';
import { privacyPolicy, termsAndConditions, type LegalDocument } from '@/data/legal';

const PRIVACY_LINK = /\[\[privacy\]\](.*?)\[\[\/privacy\]\]/;

function Paragraph({ text }: { text: string }) {
  const match = text.match(PRIVACY_LINK);
  if (!match || match.index === undefined) return <>{text}</>;
  return (
    <>
      {text.slice(0, match.index)}
      <Link to="/privacy-policy" className="text-[#1A1A1A] font-medium underline hover:no-underline">
        {match[1]}
      </Link>
      {text.slice(match.index + match[0].length)}
    </>
  );
}

function LegalDocumentPage({ doc }: { doc: LegalDocument }) {
  return (
    <div className="mt-[72px]">
      <PageBanner title={doc.title} subtitle={`Last Updated: ${doc.updated}`} />

      <div className="max-w-[860px] mx-auto px-6 lg:px-12 py-12 md:py-16">
        {doc.intro.map((text, i) => (
          <p key={i} className="text-base text-[#666] leading-relaxed mb-4">{text}</p>
        ))}

        {doc.sections.map(section => (
          <section key={section.heading} className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#1A1A1A] mb-4 pb-3 border-b border-[#E5E5E5]">
              {section.heading}
            </h2>
            {section.paragraphs.map((text, i) => (
              <p key={i} className="text-base text-[#666] leading-relaxed mb-4">
                <Paragraph text={text} />
              </p>
            ))}
            {section.heading === 'Contact Us' && doc.contact && (
              <Fragment>
                <p className="text-base text-[#666] leading-relaxed">
                  <span className="font-semibold text-[#1A1A1A]">UniStyle</span>
                  <br />
                  <span className="font-medium text-[#1A1A1A]">Website:</span>{' '}
                  <a href={doc.contact.website} className="underline hover:text-[#1A1A1A]">{doc.contact.website}</a>
                  <br />
                  <span className="font-medium text-[#1A1A1A]">Email:</span>{' '}
                  <a href={`mailto:${doc.contact.email}`} className="underline hover:text-[#1A1A1A]">{doc.contact.email}</a>
                </p>
              </Fragment>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

export function PrivacyPolicyPage() {
  return <LegalDocumentPage doc={privacyPolicy} />;
}

export function TermsPage() {
  return <LegalDocumentPage doc={termsAndConditions} />;
}
