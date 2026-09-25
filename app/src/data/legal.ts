// Content sourced from the UniStyle FAQs / Privacy Policy / T&C documents (September 2026).
// A "[[privacy]]...[[/privacy]]" marker inside a paragraph renders as a link to the Privacy Policy page.

export interface LegalSection { heading: string; paragraphs: string[] }
export interface LegalDocument {
  title: string;
  updated: string;
  intro: string[];
  sections: LegalSection[];
  contact: { website: string; email: string } | null;
}
export interface FaqItem { question: string; answer: string }

export const privacyPolicy: LegalDocument = {
  "title": "Privacy Policy",
  "updated": "September 2026",
  "intro": [
    "UniStyle (“UniStyle”, “we”, “us” or “our”) respects your privacy and is committed to handling personal information responsibly, transparently and securely. This Privacy Policy explains how information may be collected, used, stored, disclosed and protected when you access or use the UniStyle website, mobile experience, products, services or any other digital service operated under the UniStyle brand.",
    "By accessing or using UniStyle, you acknowledge that your information may be handled in accordance with this Privacy Policy and applicable data protection and privacy laws."
  ],
  "sections": [
    {
      "heading": "Information We Collect",
      "paragraphs": [
        "We collect information that is reasonably necessary to provide, operate and improve the UniStyle platform and its services.",
        "Information you provide directly may include your name, email address, telephone number, account credentials, delivery address, billing information, product preferences, sizing information, order details and any information you voluntarily provide when contacting customer support, submitting feedback, participating in a promotion or otherwise interacting with UniStyle.",
        "When you make a purchase, payment-related information may be processed through authorised third-party payment service providers. UniStyle does not need to store complete payment-card information where such information is processed securely by the relevant payment provider.",
        "We may also automatically receive limited technical information when you use the platform, such as your IP address, browser type, device type, operating system, referring pages, pages viewed, session information and interactions with the website. This information may be collected through cookies and similar technologies where applicable."
      ]
    },
    {
      "heading": "How We Use Your Information",
      "paragraphs": [
        "We may use personal information to provide and improve the UniStyle experience, create and manage user accounts, process and fulfil orders, arrange deliveries, facilitate payments, provide order confirmations and updates, process returns, exchanges and refunds, respond to enquiries, provide customer support and maintain records relating to transactions.",
        "Information may also be used to improve the performance, functionality, security and usability of the platform, understand customer preferences, develop products and services, prevent fraud or misuse, troubleshoot technical issues and protect UniStyle, its customers and its partners.",
        "Where permitted by applicable law, information may also be used to communicate offers, product launches, promotions, university collections, updates and other UniStyle communications that may be relevant to users. Users may opt out of promotional communications at any time using the unsubscribe option provided or by contacting UniStyle.",
        "Transactional or service-related communications, such as order confirmations, delivery updates, security notifications or responses to customer requests, may continue even where promotional communications have been disabled."
      ]
    },
    {
      "heading": "Basis for Processing",
      "paragraphs": [
        "UniStyle processes personal information only where there is an appropriate basis for doing so under applicable law.",
        "Depending on the circumstances, this may include processing necessary to provide a requested service or fulfil an order, processing required to comply with legal obligations, processing based on the user's consent, or processing reasonably necessary for legitimate business purposes where permitted by law and where such interests do not improperly override the rights of the individual.",
        "Where processing is based on consent, consent may be withdrawn where permitted by applicable law."
      ]
    },
    {
      "heading": "Orders and Payments",
      "paragraphs": [
        "Information provided when placing an order may be used to verify, process, fulfil and manage that transaction.",
        "Payments may be processed by independent payment providers or financial institutions operating their own secure systems. Those providers may process payment information in accordance with their own terms and privacy policies.",
        "UniStyle will only receive or retain the information reasonably required to confirm, administer or reconcile transactions, subject to the systems and payment methods being used."
      ]
    },
    {
      "heading": "Delivery and Fulfilment",
      "paragraphs": [
        "Where necessary to complete an order, relevant information such as the recipient's name, contact details, delivery address and order information may be shared with logistics, delivery, fulfilment or related service providers.",
        "Only information reasonably required for the relevant service should be made available to such providers."
      ]
    },
    {
      "heading": "How We Share Information",
      "paragraphs": [
        "UniStyle does not disclose personal information unnecessarily.",
        "Information may be shared with trusted service providers where reasonably required to operate the platform or provide services to users. These may include technology providers, website hosting providers, payment processors, logistics and delivery providers, customer-support services, analytics providers, professional advisers and other suppliers supporting UniStyle's operations.",
        "Information may also be disclosed where reasonably necessary to comply with applicable law, a lawful request from a competent authority, legal proceedings, regulatory requirements, fraud prevention, enforcement of contractual rights, or the protection of UniStyle, its customers or others.",
        "Where UniStyle undergoes or considers a corporate restructuring, investment, financing, merger, acquisition, sale of assets or similar transaction, relevant business information may be disclosed to professional advisers, investors or transaction counterparties subject to appropriate confidentiality and legal safeguards.",
        "UniStyle does not sell personal information as part of its ordinary business operations."
      ]
    },
    {
      "heading": "Cookies and Similar Technologies",
      "paragraphs": [
        "UniStyle may use cookies and similar technologies to operate the website, remember user preferences, maintain sessions, understand how the platform is used, improve performance and provide relevant functionality.",
        "Some cookies may be essential for the platform to function correctly, while others may support analytics, preferences or marketing functionality where implemented.",
        "Users may be able to manage certain cookies through their browser settings or through any cookie-management tools made available on the UniStyle platform. Disabling certain cookies may affect the availability or performance of some features."
      ]
    },
    {
      "heading": "Analytics and Platform Improvement",
      "paragraphs": [
        "UniStyle may use aggregated, anonymised or statistical information to understand how customers interact with the platform and its products.",
        "Such information may be used to evaluate platform performance, improve navigation, optimise product offerings, understand demand and support commercial and operational decision-making.",
        "Where third-party analytics technologies are used, they will be subject to applicable privacy requirements and the relevant provider's terms."
      ]
    },
    {
      "heading": "Marketing Communications",
      "paragraphs": [
        "Where permitted by law, UniStyle may communicate with users regarding new collections, products, collaborations, promotions, offers and other updates.",
        "Marketing communications may be sent through channels such as email, SMS or other digital communication methods where the user has provided the necessary information or permissions.",
        "Users may withdraw from promotional communications at any time. UniStyle will respect valid opt-out requests within a reasonable period."
      ]
    },
    {
      "heading": "Data Retention",
      "paragraphs": [
        "UniStyle retains personal information only for as long as reasonably necessary for the purpose for which it was collected or where retention is required for legitimate business, legal, accounting, tax, fraud-prevention, dispute-resolution or regulatory purposes.",
        "Different categories of information may therefore be retained for different periods.",
        "Where information is no longer reasonably required, UniStyle may delete, securely dispose of or anonymise it in accordance with applicable requirements and operational practices."
      ]
    },
    {
      "heading": "Data Security",
      "paragraphs": [
        "UniStyle takes reasonable administrative, organisational and technical measures designed to protect personal information against unauthorised access, loss, misuse, alteration, disclosure or destruction.",
        "Access to personal information should be limited to persons and service providers who reasonably require such access for legitimate purposes.",
        "While UniStyle takes reasonable precautions to safeguard information, no website, electronic transmission or storage system can be guaranteed to be completely secure. Users are therefore also responsible for maintaining the confidentiality of their account credentials and taking reasonable precautions when using online services."
      ]
    },
    {
      "heading": "International Data Processing",
      "paragraphs": [
        "UniStyle may use technology infrastructure, cloud services or other service providers that operate in more than one country.",
        "As a result, personal information may, where necessary, be processed or stored outside the country in which the user is located.",
        "Where cross-border processing takes place, UniStyle will seek to ensure that appropriate measures are applied as required under applicable data protection laws."
      ]
    },
    {
      "heading": "Your Privacy Rights",
      "paragraphs": [
        "Depending on applicable law and the circumstances of the request, users may have rights in relation to their personal information.",
        "These may include the right to request access to certain personal information, request correction of inaccurate or incomplete information, request deletion where legally permitted, withdraw consent where processing is based on consent, object to or restrict certain processing, and request information concerning the manner in which personal information is being processed.",
        "Certain requests may be subject to legal exceptions, verification requirements or legitimate retention obligations.",
        "UniStyle may request information reasonably necessary to verify the identity of the person making a privacy request before taking action."
      ]
    },
    {
      "heading": "Account Information and Deletion",
      "paragraphs": [
        "Users may update certain account information through the platform where this functionality is available or may contact UniStyle to request assistance.",
        "Where account deletion is requested, UniStyle may delete or deactivate the relevant account while retaining information that must reasonably be preserved for completed transactions, legal compliance, accounting requirements, fraud prevention, dispute resolution or other permitted purposes.",
        "Deletion of an account therefore may not result in the immediate deletion of every record relating to previous transactions."
      ]
    },
    {
      "heading": "Children's Privacy",
      "paragraphs": [
        "UniStyle offers products that may be used by students of different age groups. However, the platform is not intended to encourage children to independently provide personal information where parental or guardian involvement is legally required.",
        "Where purchases or accounts involve minors, a parent, guardian or other authorised adult should supervise the interaction where appropriate.",
        "UniStyle does not knowingly seek to collect unnecessary personal information from children. If UniStyle becomes aware that personal information relating to a child has been collected in circumstances that do not comply with applicable requirements, reasonable steps may be taken to review, restrict or remove such information."
      ]
    },
    {
      "heading": "Third-Party Websites and Services",
      "paragraphs": [
        "The UniStyle platform may contain links to websites, social-media platforms, payment providers or other services operated by third parties.",
        "UniStyle does not control the privacy practices of independent third parties. Users should review the privacy policies and terms applicable to those services before providing personal information to them.",
        "The inclusion of an external link does not mean that UniStyle is responsible for the privacy or security practices of the relevant third party."
      ]
    },
    {
      "heading": "Business and University Partners",
      "paragraphs": [
        "UniStyle may collaborate with universities, schools, brands, manufacturers, suppliers or other organisations in connection with merchandise, collections, fulfilment or platform services.",
        "Such collaborations do not automatically entitle those organisations to access UniStyle customer information. Personal information will only be shared where reasonably necessary, legally permitted and relevant to the applicable service or collaboration."
      ]
    },
    {
      "heading": "Changes to This Privacy Policy",
      "paragraphs": [
        "UniStyle may update this Privacy Policy periodically to reflect changes to the platform, services, operational practices or applicable legal requirements.",
        "The latest version will be made available through the UniStyle platform and the “Last Updated” date may be revised accordingly.",
        "Where appropriate, significant changes may also be communicated through the platform or another reasonable communication method."
      ]
    },
    {
      "heading": "Contact Us",
      "paragraphs": [
        "Questions, requests or concerns regarding this Privacy Policy or the handling of personal information may be submitted to UniStyle through the contact details made available on the platform."
      ]
    }
  ],
  "contact": {
    "website": "https://uni-style-fe.vercel.app/",
    "email": "response@theunistyle.com"
  }
};

export const termsAndConditions: LegalDocument = {
  "title": "Terms & Conditions",
  "updated": "September 2026",
  "intro": [
    "Welcome to UniStyle. These Terms & Conditions (“Terms”) govern your access to and use of the UniStyle website, platform, products and services. By accessing, browsing or using UniStyle, creating an account or placing an order, you agree to be bound by these Terms together with any policies referred to within them.",
    "If you do not agree with these Terms, you should not use the UniStyle platform."
  ],
  "sections": [
    {
      "heading": "About UniStyle",
      "paragraphs": [
        "UniStyle is a student-focused commerce platform offering university and education-related apparel, merchandise, uniforms, accessories and related products and services.",
        "The products, collections and services available on UniStyle may change from time to time as the platform develops."
      ]
    },
    {
      "heading": "Use of the Platform",
      "paragraphs": [
        "You may use UniStyle only for lawful purposes and in accordance with these Terms.",
        "You must not misuse the platform, attempt to gain unauthorised access to any part of it, interfere with its operation, introduce malicious software, use automated systems to improperly extract information, impersonate another person or use the platform in any manner that may harm UniStyle, its users or third parties.",
        "UniStyle may restrict, suspend or terminate access where it reasonably believes the platform is being misused or these Terms have been violated."
      ]
    },
    {
      "heading": "User Accounts",
      "paragraphs": [
        "Certain features of UniStyle may require users to create an account.",
        "You are responsible for providing accurate and current information and for maintaining the confidentiality of your login credentials. You are also responsible for activity carried out through your account unless such activity results from circumstances outside your reasonable control.",
        "UniStyle may request verification of account information where reasonably necessary for security, fraud prevention, order processing or customer support.",
        "Users should notify UniStyle promptly if they believe their account has been accessed without authorisation."
      ]
    },
    {
      "heading": "Product Information",
      "paragraphs": [
        "UniStyle aims to present product descriptions, photographs, colours, sizing, specifications and other information as accurately as reasonably possible.",
        "However, colours and appearance may vary slightly depending on the user's device, display settings, photography, lighting or manufacturing variation.",
        "Measurements and sizing information are provided as guidance and minor variations may occur between products, suppliers or manufacturing batches.",
        "Where a product is personalised, customised, embroidered, printed or produced to specific requirements, the final product may contain reasonable manufacturing variations."
      ]
    },
    {
      "heading": "Product Availability",
      "paragraphs": [
        "All products are subject to availability.",
        "Adding an item to a cart or wishlist does not reserve that item or guarantee its availability.",
        "UniStyle may limit quantities, discontinue products, modify collections or withdraw products from sale at any time.",
        "If a product becomes unavailable after an order has been placed, UniStyle may contact the customer and, where appropriate, offer an alternative, adjustment, credit or refund."
      ]
    },
    {
      "heading": "Pricing",
      "paragraphs": [
        "Prices displayed on UniStyle will be shown in the currency indicated on the platform.",
        "UniStyle aims to ensure that pricing information is accurate. However, errors may occasionally occur.",
        "Where an obvious pricing, technical or listing error is identified before an order is fulfilled, UniStyle may contact the customer to confirm the correct price or cancel the affected item and arrange an appropriate refund where payment has already been collected.",
        "Any applicable taxes, delivery charges or other charges will be displayed where relevant before completion of the purchase.",
        "Promotional prices and offers may be available for limited periods and may be subject to additional conditions."
      ]
    },
    {
      "heading": "Orders",
      "paragraphs": [
        "Placing an order through UniStyle constitutes a request to purchase the selected products.",
        "An order is not necessarily considered accepted merely because it has been submitted through the website or because an automated acknowledgement has been issued.",
        "UniStyle may decline or cancel an order where reasonably necessary, including where a product is unavailable, payment cannot be authorised, information supplied is incomplete or inaccurate, fraud is suspected, a pricing or technical error has occurred, or fulfilment is otherwise not reasonably possible.",
        "Where payment has already been received for an order that UniStyle subsequently cancels, the relevant amount will be refunded using an appropriate payment method."
      ]
    },
    {
      "heading": "Payments",
      "paragraphs": [
        "Payments may be processed through independent payment service providers.",
        "Customers are responsible for ensuring that the payment information supplied is accurate and that they are authorised to use the selected payment method.",
        "Payment providers may apply their own terms, verification processes and security requirements.",
        "UniStyle is not responsible for delays, declines or interruptions caused directly by a customer's bank, card issuer or independent payment provider, although UniStyle may provide reasonable assistance where possible."
      ]
    },
    {
      "heading": "Delivery",
      "paragraphs": [
        "Delivery options, estimated delivery periods and applicable charges will be displayed where available during the ordering process.",
        "Delivery times are estimates unless expressly stated otherwise and may be affected by circumstances outside UniStyle's reasonable control.",
        "Customers are responsible for providing complete and accurate delivery information.",
        "UniStyle may not be responsible for additional costs or delays resulting from an incorrect or incomplete address supplied by the customer.",
        "Risk relating to delivery will be handled in accordance with applicable law and the relevant delivery arrangements."
      ]
    },
    {
      "heading": "Delays and Events Outside Our Control",
      "paragraphs": [
        "UniStyle will make reasonable efforts to fulfil orders within the expected timeframe.",
        "However, delays may occur due to circumstances outside UniStyle's reasonable control, including courier disruption, supplier delays, customs procedures, transportation interruptions, severe weather, technical failures, public emergencies or other events affecting fulfilment.",
        "Where a significant delay occurs, UniStyle will seek to provide reasonable information or assistance to the affected customer."
      ]
    },
    {
      "heading": "Returns, Exchanges and Refunds",
      "paragraphs": [
        "Returns, exchanges and refunds are subject to the conditions displayed on the UniStyle platform and applicable consumer protection requirements.",
        "Products returned should generally be unused, unworn and in their original condition with packaging and tags where reasonably applicable.",
        "Certain products may not be eligible for return or exchange where permitted by law, including personalised, customised, altered or specially produced products, or products that cannot reasonably be resold for hygiene or other legitimate reasons.",
        "Nothing in these Terms is intended to remove any mandatory consumer rights available under applicable law.",
        "Where a refund is approved, it may be issued to the original payment method or through another appropriate method depending on the circumstances and payment system used.",
        "Processing times may vary depending on the relevant bank or payment provider."
      ]
    },
    {
      "heading": "Customised and Personalised Products",
      "paragraphs": [
        "Some UniStyle products may allow customisation, personalisation, printing, embroidery, names, numbers, logos or other requested modifications.",
        "Customers are responsible for reviewing and approving the information they provide before submitting a customised order.",
        "UniStyle may not be able to change or cancel a customised order once production has started.",
        "UniStyle reserves the right to refuse customisation requests that are unlawful, offensive, misleading, infringe intellectual property rights or are otherwise inappropriate."
      ]
    },
    {
      "heading": "University and Institutional Collections",
      "paragraphs": [
        "UniStyle may feature products, collections, names, references, colours, logos or designs associated with universities, schools or other educational institutions.",
        "The availability of a collection on UniStyle does not by itself represent or imply sponsorship, endorsement, partnership or official affiliation with an institution unless such relationship is expressly stated.",
        "Where products or branding are supplied, licensed or authorised by a relevant institution or rights holder, any applicable rights and restrictions remain with their respective owners."
      ]
    },
    {
      "heading": "Intellectual Property",
      "paragraphs": [
        "The UniStyle name, platform design, graphics, photographs, product presentation, text, software, branding, original content and other materials created or owned by UniStyle are protected by applicable intellectual property laws.",
        "Users may access these materials for personal and non-commercial use in connection with using the platform.",
        "No content may be copied, reproduced, modified, distributed, sold, commercially exploited or used to create derivative works without appropriate permission.",
        "Names, logos, trademarks and other intellectual property belonging to universities, schools, manufacturers, brands or other third parties remain the property of their respective owners."
      ]
    },
    {
      "heading": "Reviews, Feedback and User Content",
      "paragraphs": [
        "Where UniStyle allows users to submit ratings, reviews, photographs, comments or other content, users must ensure that the content they submit is accurate, lawful and does not infringe the rights of another person.",
        "UniStyle may moderate, remove or decline to publish content that is misleading, abusive, unlawful, inappropriate, promotional or otherwise inconsistent with the platform.",
        "By voluntarily submitting content for publication, users grant UniStyle permission to display and use that content in connection with operating and promoting the platform, subject to applicable law and privacy requirements."
      ]
    },
    {
      "heading": "Promotions and Discount Codes",
      "paragraphs": [
        "Promotions, discount codes, vouchers and special offers may be subject to specific conditions, validity periods, eligibility requirements and product exclusions.",
        "Unless expressly stated otherwise, promotions may not be combined.",
        "UniStyle may withdraw, modify or cancel a promotion where reasonably necessary, including where misuse, fraud or a technical error has occurred."
      ]
    },
    {
      "heading": "Privacy and Personal Information",
      "paragraphs": [
        "Personal information collected through UniStyle is handled in accordance with the [[privacy]]UniStyle Privacy Policy[[/privacy]] and applicable data protection requirements.",
        "Users should review the Privacy Policy to understand how information may be collected, used, protected and shared."
      ]
    },
    {
      "heading": "Third-Party Services and Links",
      "paragraphs": [
        "UniStyle may contain links to or integrate services operated by third parties, including payment providers, social-media platforms, delivery providers or other websites.",
        "These third parties operate independently and may have their own terms, privacy policies and practices.",
        "UniStyle is not responsible for the content, availability or practices of independent third-party services except to the extent responsibility cannot lawfully be excluded."
      ]
    },
    {
      "heading": "Platform Availability",
      "paragraphs": [
        "UniStyle aims to provide a reliable platform but does not guarantee that the website or every feature will always be available without interruption.",
        "Access may occasionally be restricted due to maintenance, upgrades, security requirements, technical issues or circumstances outside UniStyle's reasonable control.",
        "Features, functionality and platform design may be changed, improved, removed or introduced as UniStyle develops."
      ]
    },
    {
      "heading": "Fraud and Misuse",
      "paragraphs": [
        "UniStyle may use reasonable measures to identify and prevent fraud, unauthorised transactions, abuse of promotions or other misuse of the platform.",
        "Orders or accounts may be reviewed, restricted or cancelled where there are reasonable grounds to suspect fraudulent or abusive activity.",
        "UniStyle may cooperate with payment providers, financial institutions or competent authorities where legally required or reasonably necessary to protect users and the platform."
      ]
    },
    {
      "heading": "Limitation of Liability",
      "paragraphs": [
        "UniStyle does not seek to exclude or limit liability where doing so would be unlawful.",
        "To the extent permitted by applicable law, UniStyle will not be responsible for indirect, incidental or consequential losses arising from the use of the platform where such losses were not reasonably foreseeable or were caused by matters outside UniStyle's reasonable control.",
        "UniStyle is not responsible for losses resulting from misuse of the platform, inaccurate information supplied by a user, unauthorised use of user credentials caused by the user's failure to protect them, or independent third-party services outside UniStyle's control.",
        "Nothing in these Terms limits any mandatory rights or remedies available to consumers under applicable law."
      ]
    },
    {
      "heading": "Indemnity",
      "paragraphs": [
        "To the extent permitted by law, users may be responsible for losses, claims or costs reasonably arising from their unlawful use of the platform, infringement of another person's rights or material breach of these Terms.",
        "This provision does not apply to losses caused by UniStyle's own unlawful conduct or matters for which liability cannot legally be transferred."
      ]
    },
    {
      "heading": "Changes to These Terms",
      "paragraphs": [
        "UniStyle may update these Terms from time to time to reflect changes to its products, services, platform functionality, business operations or applicable legal requirements.",
        "The latest version will be made available through the UniStyle platform and the Last Updated date may be revised accordingly.",
        "Changes will apply prospectively except where applicable law requires otherwise."
      ]
    },
    {
      "heading": "Severability",
      "paragraphs": [
        "If any part of these Terms is found to be invalid, unlawful or unenforceable, the remaining provisions will continue to apply to the fullest extent permitted by law."
      ]
    },
    {
      "heading": "No Waiver",
      "paragraphs": [
        "If UniStyle does not immediately enforce a provision of these Terms, this does not mean that UniStyle has waived its right to enforce that provision later."
      ]
    },
    {
      "heading": "Governing Law and Disputes",
      "paragraphs": [
        "These Terms will be interpreted in accordance with the laws applicable to UniStyle's operations and the mandatory consumer protection rights applicable to the relevant transaction.",
        "Where UniStyle operates and supplies products within the United Arab Emirates, applicable UAE laws and regulations will apply as required.",
        "UniStyle encourages users to contact its customer support team first if any concern or dispute arises so that the matter can be addressed and, where possible, resolved directly.",
        "Nothing in these Terms prevents a consumer from exercising any rights or remedies available under applicable law."
      ]
    },
    {
      "heading": "Contact Us",
      "paragraphs": [
        "Questions regarding these Terms & Conditions, orders or use of the UniStyle platform may be submitted through the contact details made available on the website."
      ]
    }
  ],
  "contact": {
    "website": "https://uni-style-fe.vercel.app/",
    "email": "response@theunistyle.com"
  }
};

export const faqs: FaqItem[] = [
  {
    "question": "What is UniStyle?",
    "answer": "UniStyle is a student-focused platform for university and education-related apparel, merchandise, uniforms and accessories."
  },
  {
    "question": "What products can I find on UniStyle?",
    "answer": "UniStyle may offer T-shirts, hoodies, sweatshirts, jackets, uniforms, sportswear, caps, bags and other student merchandise."
  },
  {
    "question": "Which universities and institutions are available?",
    "answer": "Available universities, schools and institutions are shown on the platform. New collections may be added over time."
  },
  {
    "question": "Is all merchandise officially licensed?",
    "answer": "Where a product or collection is officially licensed, authorised or created in collaboration with an institution, this will be stated where applicable."
  },
  {
    "question": "How do I choose the right size?",
    "answer": "Please refer to the size guide shown with the relevant product, as sizing may vary between products and manufacturers."
  },
  {
    "question": "Can I customise or personalise products?",
    "answer": "Certain products may offer customisation, printing or embroidery. Available options will be shown on the relevant product page."
  },
  {
    "question": "How long does delivery take?",
    "answer": "Estimated delivery times will be shown during checkout and may vary depending on product availability, location and customisation requirements."
  },
  {
    "question": "Can I return or exchange an item?",
    "answer": "Eligible items may be returned or exchanged subject to UniStyle’s applicable return conditions. Customised or personalised products may have different conditions."
  },
  {
    "question": "What if I receive a damaged or incorrect item?",
    "answer": "Contact UniStyle with your order details and information about the issue. We will review it and arrange an appropriate resolution."
  },
  {
    "question": "Can universities, schools or student organisations partner with UniStyle?",
    "answer": "Yes. Universities, schools, student societies, clubs and other educational organisations can contact UniStyle to discuss merchandise, bulk orders or collaboration opportunities."
  }
];
