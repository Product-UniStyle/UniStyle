export const universityLogos: { name: string; logo: string }[] = [
  { name: 'University of Birmingham', logo: '/University-of-Birmingham.jpeg' },
  { name: 'Middlesex University', logo: '/Middlesex-University.jpeg' },
  { name: 'Heriot-Watt University', logo: '/Heriot-Watt-University.jpeg' },
  { name: 'University of Wollongong', logo: '/University-of-Wollongong.jpeg' },
  { name: 'New York University', logo: '/New-York-University.jpeg' },
  { name: 'De Montfort University', logo: '/De-Montfort-University.jpeg' },
];

export function getInstitutionLogo(name: string): string | undefined {
  return universityLogos.find(u => u.name === name)?.logo;
}
