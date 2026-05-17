import Opportunity from '../models/Opportunity';
import Influencer from '../models/Influencer';
import User from '../models/User';

const opportunities = [
  // ─── FRANCHISES ───────────────────────────────────────────────────────────
  {
    type: 'brand',
    brand_name: 'Chai Sutta Bar',
    category: 'Food & Beverage',
    investment_range: '₹8L - ₹15L',
    minInvestment: 800000, maxInvestment: 1500000,
    description: "India's fastest-growing youth-centric chai café with 500+ outlets. Signature Kulhad chai, snacks, and a high-footfall model delivering consistent ROI within 14 months.",
    image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?q=80&w=1600&auto=format&fit=crop',
    logo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=100&h=100&auto=format&fit=crop&crop=center',
    location: 'Pan India', is_verified: true, status: 'published',
    owner_uid: 'seed-brand-csb', tags: ['chai', 'cafe', 'beverage', 'kulhad'],
    areaRequired: '200 - 400 sq ft', roiMonths: 14, franchiseFee: '₹3L', setupCost: '₹7L',
    monthlyRoyalty: '5% of revenue', businessModel: 'FOFO', employees_req: '3 - 5',
    space_req: '200 to 400 sft', presenceCount: '500+ Outlets', breakEvenMonths: 14,
    tierTarget: 'Tier 2, Tier 3', marketHotness: 'high', trustScore: 92,
    trainingDays: 7, trainingFor: 'Owner + Staff',
    marketingSupport: 'Social media, branding kits, regional campaigns', sopManualGiven: true,
    locationsLookingFor: ['Uttar Pradesh', 'Rajasthan', 'Maharashtra', 'Gujarat', 'Madhya Pradesh'],
    usp: 'Kulhad chai culture with modern café experience', margins: '35-45% gross',
    targetLocations: 'Railway stations, colleges, markets'
  },
  {
    type: 'brand',
    brand_name: 'Frozen Bottle',
    category: 'Food & Beverage',
    investment_range: '₹10L - ₹20L',
    minInvestment: 1000000, maxInvestment: 2000000,
    description: 'Premium milkshake, smoothie, and dessert brand with 350+ outlets. Trendy formats designed for malls and high-street locations across Tier 1 and Tier 2 cities.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1600&auto=format&fit=crop',
    logo: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=100&h=100&auto=format&fit=crop&crop=center',
    location: 'Pan India', is_verified: true, status: 'published',
    owner_uid: 'seed-brand-fb', tags: ['milkshakes', 'desserts', 'smoothies', 'beverages'],
    areaRequired: '150 - 300 sq ft', roiMonths: 16, franchiseFee: '₹4L', setupCost: '₹9L',
    monthlyRoyalty: '6% of revenue', businessModel: 'FOFO', employees_req: '2 - 4',
    space_req: '150 to 300 sft', presenceCount: '350+ Outlets', breakEvenMonths: 16,
    tierTarget: 'Tier 1, Tier 2', marketHotness: 'high', trustScore: 88,
    trainingDays: 5, trainingFor: 'Owner + Staff', sopManualGiven: true,
    marketingSupport: 'Instagram campaigns, influencer marketing, in-store displays',
    locationsLookingFor: ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana'],
    usp: 'Instagrammable beverages driving repeat footfall', margins: '40-50% gross',
    targetLocations: 'Malls, high streets, food courts'
  },
  {
    type: 'brand',
    brand_name: 'Mast Kalandar',
    category: 'Food & Beverage',
    investment_range: '₹20L - ₹40L',
    minInvestment: 2000000, maxInvestment: 4000000,
    description: 'South Indian quick-service restaurant chain known for authentic flavours and clean operations. Franchise model with centralized kitchen supply and strong regional brand recall.',
    image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?q=80&w=1600&auto=format&fit=crop',
    logo: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=100&h=100&auto=format&fit=crop&crop=center',
    location: 'South India', is_verified: true, status: 'published',
    owner_uid: 'seed-brand-mk', tags: ['south indian', 'qsr', 'restaurant', 'dosa'],
    areaRequired: '500 - 800 sq ft', roiMonths: 20, franchiseFee: '₹6L', setupCost: '₹18L',
    monthlyRoyalty: '7% of revenue', businessModel: 'FOFO', employees_req: '6 - 10',
    space_req: '500 to 800 sft', presenceCount: '150+ Outlets', breakEvenMonths: 20,
    tierTarget: 'Tier 1, Tier 2', marketHotness: 'medium', trustScore: 85,
    trainingDays: 14, trainingFor: 'Manager + Staff', sopManualGiven: true,
    marketingSupport: 'National campaigns, digital marketing, POS materials',
    locationsLookingFor: ['Karnataka', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'Kerala'],
    usp: 'Authentic South Indian QSR with low wastage kitchen model', margins: '30-38% gross',
    targetLocations: 'High streets, office areas, residential complexes'
  },
  {
    type: 'brand',
    brand_name: 'Naturals Salon',
    category: 'Beauty & Wellness',
    investment_range: '₹15L - ₹25L',
    minInvestment: 1500000, maxInvestment: 2500000,
    description: "India's largest salon chain with 700+ salons. Naturals offers a complete franchise package including equipment, training, and marketing support with guaranteed territorial exclusivity.",
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1600&auto=format&fit=crop',
    logo: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=100&h=100&auto=format&fit=crop&crop=center',
    location: 'Pan India', is_verified: true, status: 'published',
    owner_uid: 'seed-brand-nat', tags: ['salon', 'beauty', 'wellness', 'hair'],
    areaRequired: '400 - 600 sq ft', roiMonths: 18, franchiseFee: '₹5L', setupCost: '₹12L',
    monthlyRoyalty: '5% of revenue', businessModel: 'FOFO', employees_req: '5 - 8',
    space_req: '400 to 600 sft', presenceCount: '700+ Salons', breakEvenMonths: 18,
    tierTarget: 'Tier 1, Tier 2, Tier 3', marketHotness: 'high', trustScore: 90,
    trainingDays: 10, trainingFor: 'Stylist + Manager', sopManualGiven: true,
    marketingSupport: 'National brand campaigns, loyalty app, digital ads',
    locationsLookingFor: ['Tamil Nadu', 'Maharashtra', 'Gujarat', 'Rajasthan', 'Punjab'],
    usp: 'Largest Indian salon brand with proven systems', margins: '38-48% gross',
    targetLocations: 'Residential areas, markets, malls'
  },
  {
    type: 'brand',
    brand_name: 'Kidzee Preschool',
    category: 'Education',
    investment_range: '₹8L - ₹15L',
    minInvestment: 800000, maxInvestment: 1500000,
    description: "Asia's largest preschool network with 2000+ centres. Kidzee's award-winning curriculum and strong brand recognition drive consistent enrolment across urban and semi-urban India.",
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1600&auto=format&fit=crop',
    logo: 'https://images.unsplash.com/photo-1536104968055-4d61aa56f46a?q=80&w=100&h=100&auto=format&fit=crop&crop=center',
    location: 'Pan India', is_verified: true, status: 'published',
    owner_uid: 'seed-brand-kz', tags: ['preschool', 'education', 'kids', 'learning'],
    areaRequired: '2000 - 4000 sq ft', roiMonths: 24, franchiseFee: '₹3.5L', setupCost: '₹7L',
    monthlyRoyalty: '15% of fees collected', businessModel: 'FOFO', employees_req: '4 - 8',
    space_req: '2000 to 4000 sft', presenceCount: '2000+ Centres', breakEvenMonths: 24,
    tierTarget: 'Tier 2, Tier 3', marketHotness: 'high', trustScore: 94,
    trainingDays: 10, trainingFor: 'Centre Director + Teachers', sopManualGiven: true,
    marketingSupport: 'National campaigns, app-based parent engagement, digital materials',
    locationsLookingFor: ['Uttar Pradesh', 'Bihar', 'Rajasthan', 'Madhya Pradesh', 'Haryana'],
    usp: "Asia's largest preschool brand with 20+ years legacy", margins: '40-55% gross',
    targetLocations: 'Residential localities, independent buildings'
  },
  {
    type: 'brand',
    brand_name: 'VLCC Wellness',
    category: 'Health & Wellness',
    investment_range: '₹25L - ₹50L',
    minInvestment: 2500000, maxInvestment: 5000000,
    description: 'Premium wellness and slimming franchise with 350+ centres in India. VLCC combines clinical expertise with beauty services for a full wellness experience with high client retention.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1600&auto=format&fit=crop',
    logo: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=100&h=100&auto=format&fit=crop&crop=center',
    location: 'Pan India', is_verified: true, status: 'published',
    owner_uid: 'seed-brand-vlcc', tags: ['wellness', 'slimming', 'fitness', 'beauty'],
    areaRequired: '800 - 1200 sq ft', roiMonths: 24, franchiseFee: '₹8L', setupCost: '₹22L',
    monthlyRoyalty: '8% of revenue', businessModel: 'FOFO', employees_req: '8 - 12',
    space_req: '800 to 1200 sft', presenceCount: '350+ Centres', breakEvenMonths: 24,
    tierTarget: 'Tier 1, Tier 2', marketHotness: 'high', trustScore: 91,
    trainingDays: 21, trainingFor: 'All Staff + Manager', sopManualGiven: true,
    marketingSupport: 'TV, digital, referral programs, in-centre branding',
    locationsLookingFor: ['Delhi NCR', 'Maharashtra', 'Gujarat', 'Tamil Nadu', 'Karnataka'],
    usp: 'Clinical + beauty wellness model for high-income clients', margins: '45-55% gross',
    targetLocations: 'Premium malls, high streets, standalone units'
  },
  {
    type: 'brand',
    brand_name: 'Dr. Batra\'s Homeopathy',
    category: 'Healthcare',
    investment_range: '₹20L - ₹35L',
    minInvestment: 2000000, maxInvestment: 3500000,
    description: 'Trusted homeopathy chain with 250+ clinics nationwide. Dr. Batra\'s offers a complete clinical setup, brand protocols, and patient management systems for franchise partners.',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=1600&auto=format&fit=crop',
    logo: 'https://images.unsplash.com/photo-1576671081837-49000212a370?q=80&w=100&h=100&auto=format&fit=crop&crop=center',
    location: 'Pan India', is_verified: true, status: 'published',
    owner_uid: 'seed-brand-drb', tags: ['homeopathy', 'clinic', 'healthcare', 'doctor'],
    areaRequired: '500 - 800 sq ft', roiMonths: 22, franchiseFee: '₹7L', setupCost: '₹16L',
    monthlyRoyalty: '20% of collections', businessModel: 'FOFO', employees_req: '3 - 6',
    space_req: '500 to 800 sft', presenceCount: '250+ Clinics', breakEvenMonths: 22,
    tierTarget: 'Tier 1, Tier 2, Tier 3', marketHotness: 'medium', trustScore: 88,
    trainingDays: 14, trainingFor: 'Doctor + Staff', sopManualGiven: true,
    marketingSupport: 'National brand spend, digital ads, patient referral system',
    locationsLookingFor: ['Uttar Pradesh', 'Maharashtra', 'Rajasthan', 'Gujarat', 'Delhi'],
    usp: '30+ year clinical legacy with scientific homeopathy', margins: '40-50% gross',
    targetLocations: 'Residential areas, medical complexes'
  },
  {
    type: 'brand',
    brand_name: 'EuroKids International',
    category: 'Education',
    investment_range: '₹6L - ₹12L',
    minInvestment: 600000, maxInvestment: 1200000,
    description: 'Premium preschool brand with 1000+ schools across India. EuroKids focuses on holistic child development using internationally benchmarked curriculum with strong parent community engagement.',
    image: 'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?q=80&w=1600&auto=format&fit=crop',
    logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=100&h=100&auto=format&fit=crop&crop=center',
    location: 'Pan India', is_verified: true, status: 'published',
    owner_uid: 'seed-brand-ek', tags: ['preschool', 'education', 'kids', 'international'],
    areaRequired: '1500 - 3000 sq ft', roiMonths: 20, franchiseFee: '₹2.5L', setupCost: '₹5.5L',
    monthlyRoyalty: '12% of fees', businessModel: 'FOFO', employees_req: '3 - 6',
    space_req: '1500 to 3000 sft', presenceCount: '1000+ Schools', breakEvenMonths: 20,
    tierTarget: 'Tier 2, Tier 3', marketHotness: 'high', trustScore: 89,
    trainingDays: 7, trainingFor: 'Director + Teaching Staff', sopManualGiven: true,
    marketingSupport: 'Digital campaigns, parent engagement tools, admissions kit',
    locationsLookingFor: ['Rajasthan', 'Madhya Pradesh', 'Uttar Pradesh', 'Bihar', 'West Bengal'],
    usp: 'International curriculum at accessible investment', margins: '42-52% gross',
    targetLocations: 'Residential societies, suburban areas'
  },
  {
    type: 'brand',
    brand_name: 'Apollo Pharmacy',
    category: 'Healthcare',
    investment_range: '₹15L - ₹30L',
    minInvestment: 1500000, maxInvestment: 3000000,
    description: "Join India's most trusted pharmacy network with 5500+ stores. Apollo Pharmacy offers strong supply chain, inventory management systems, and 24×7 support for franchise partners.",
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=1600&auto=format&fit=crop',
    logo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=100&h=100&auto=format&fit=crop&crop=center',
    location: 'Pan India', is_verified: true, status: 'published',
    owner_uid: 'seed-brand-aph', tags: ['pharmacy', 'healthcare', 'medicine', 'apollo'],
    areaRequired: '300 - 500 sq ft', roiMonths: 18, franchiseFee: '₹5L', setupCost: '₹14L',
    monthlyRoyalty: '4% of sales', businessModel: 'FOFO', employees_req: '2 - 4',
    space_req: '300 to 500 sft', presenceCount: '5500+ Stores', breakEvenMonths: 18,
    tierTarget: 'Tier 1, Tier 2, Tier 3', marketHotness: 'high', trustScore: 96,
    trainingDays: 5, trainingFor: 'Pharmacist + Staff', sopManualGiven: true,
    marketingSupport: 'Apollo loyalty app, digital ads, health camps',
    locationsLookingFor: ['Uttar Pradesh', 'Rajasthan', 'Bihar', 'West Bengal', 'Odisha'],
    usp: 'India\'s most trusted pharmacy brand with GenAI-powered ops', margins: '18-28% gross',
    targetLocations: 'Residential areas, hospitals, commercial streets'
  },
  {
    type: 'brand',
    brand_name: 'FitLife Studio',
    category: 'Health & Fitness',
    investment_range: '₹12L - ₹25L',
    minInvestment: 1200000, maxInvestment: 2500000,
    description: 'Premium boutique fitness studio franchise delivering certified personal training, group classes, and nutrition consulting. Strong retention model with recurring monthly memberships.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1600&auto=format&fit=crop',
    logo: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=100&h=100&auto=format&fit=crop&crop=center',
    location: 'Metro & Tier 1 Cities', is_verified: true, status: 'published',
    owner_uid: 'seed-brand-fl', tags: ['gym', 'fitness', 'wellness', 'health'],
    areaRequired: '1000 - 2000 sq ft', roiMonths: 18, franchiseFee: '₹4L', setupCost: '₹12L',
    monthlyRoyalty: '6% of revenue', businessModel: 'FOFO', employees_req: '4 - 8',
    space_req: '1000 to 2000 sft', presenceCount: '120+ Studios', breakEvenMonths: 18,
    tierTarget: 'Tier 1', marketHotness: 'high', trustScore: 87,
    trainingDays: 14, trainingFor: 'Trainers + Manager', sopManualGiven: true,
    marketingSupport: 'Digital marketing, referral programs, influencer partnerships',
    locationsLookingFor: ['Delhi NCR', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Pune'],
    usp: 'Boutique fitness with certified trainers and nutrition plans', margins: '42-55% gross',
    targetLocations: 'Residential complexes, malls, commercial areas'
  },

  // ─── DEALERSHIPS ─────────────────────────────────────────────────────────
  {
    type: 'dealership',
    brand_name: 'Hero MotoCorp Dealership',
    category: 'Automotive',
    investment_range: '₹40L - ₹80L',
    minInvestment: 4000000, maxInvestment: 8000000,
    description: "Authorized dealership for the world's largest two-wheeler manufacturer. Hero MotoCorp's dealer network spans 8000+ touchpoints with strong after-sales and service revenue.",
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1600&auto=format&fit=crop',
    logo: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=100&h=100&auto=format&fit=crop&crop=center',
    location: 'Pan India', is_verified: true, status: 'published',
    owner_uid: 'seed-deal-hero', tags: ['two-wheeler', 'bikes', 'hero', 'automotive'],
    areaRequired: '2000 - 5000 sq ft', roiMonths: 30, businessModel: 'COCO',
    employees_req: '8 - 15', space_req: '2000 to 5000 sft', presenceCount: '8000+ Outlets',
    breakEvenMonths: 30, tierTarget: 'Tier 2, Tier 3', marketHotness: 'medium', trustScore: 95,
    trainingDays: 30, trainingFor: 'Sales + Service Team', sopManualGiven: true,
    marketingSupport: 'National TV, digital, regional campaigns',
    locationsLookingFor: ['Uttar Pradesh', 'Bihar', 'Rajasthan', 'Haryana', 'Punjab'],
    usp: "World's #1 two-wheeler brand with unmatched service network", margins: '8-14% gross',
    targetLocations: 'Town centres, highways, commercial zones',
    showroomLayoutReq: 'As per Hero brand guidelines',
    afterSalesServiceDetails: 'Workshop + spares revenue',
    marginPerUnitRange: '₹3,000 - ₹8,000 per unit'
  },
  {
    type: 'dealership',
    brand_name: 'Havells Electricals',
    category: 'Electronics',
    investment_range: '₹15L - ₹30L',
    minInvestment: 1500000, maxInvestment: 3000000,
    description: "Premium authorized dealership for Havells — India's leading electricals brand covering fans, wires, switches, lighting, and appliances. Strong brand pull with significant B2B and retail demand.",
    image: 'https://images.unsplash.com/photo-1621972660772-6a0427d5e57d?q=80&w=1600&auto=format&fit=crop',
    logo: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=100&h=100&auto=format&fit=crop&crop=center',
    location: 'Pan India', is_verified: true, status: 'published',
    owner_uid: 'seed-deal-hav', tags: ['electricals', 'fans', 'wiring', 'havells'],
    areaRequired: '500 - 1000 sq ft', roiMonths: 20, businessModel: 'FOFO',
    employees_req: '3 - 5', space_req: '500 to 1000 sft', presenceCount: '4500+ Dealers',
    breakEvenMonths: 20, tierTarget: 'Tier 2, Tier 3', marketHotness: 'medium', trustScore: 91,
    trainingDays: 7, trainingFor: 'Sales + Technical Team', sopManualGiven: true,
    marketingSupport: 'Dealer branding, digital ads, training programs',
    locationsLookingFor: ['Maharashtra', 'Gujarat', 'Rajasthan', 'Tamil Nadu', 'West Bengal'],
    usp: 'India\'s premium electricals brand with strong construction demand', margins: '12-20% gross',
    targetLocations: 'Hardware markets, commercial areas, standalone shops'
  },
  {
    type: 'dealership',
    brand_name: 'Asian Paints Studio',
    category: 'Home & Decor',
    investment_range: '₹10L - ₹20L',
    minInvestment: 1000000, maxInvestment: 2000000,
    description: "Become an Asian Paints dealer in India's ₹60,000 crore paints market. Benefit from strong brand demand, consistent off-take, technical support, and digital color-matching tools.",
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1600&auto=format&fit=crop',
    logo: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=100&h=100&auto=format&fit=crop&crop=center',
    location: 'Pan India', is_verified: true, status: 'published',
    owner_uid: 'seed-deal-ap', tags: ['paints', 'asian paints', 'home decor', 'interior'],
    areaRequired: '300 - 600 sq ft', roiMonths: 16, businessModel: 'FOFO',
    employees_req: '2 - 4', space_req: '300 to 600 sft', presenceCount: '70,000+ Dealers',
    breakEvenMonths: 16, tierTarget: 'Tier 2, Tier 3', marketHotness: 'medium', trustScore: 93,
    trainingDays: 5, trainingFor: 'Dealer + Sales Staff', sopManualGiven: true,
    marketingSupport: 'Dealer hoardings, digital tools, local co-op advertising',
    locationsLookingFor: ['Rajasthan', 'Madhya Pradesh', 'Uttar Pradesh', 'Bihar', 'Jharkhand'],
    usp: 'Market leader in paints with digital color-matching technology', margins: '15-22% gross',
    targetLocations: 'Hardware markets, construction zones, commercial streets'
  },
  {
    type: 'dealership',
    brand_name: 'Bajaj Auto Dealership',
    category: 'Automotive',
    investment_range: '₹50L - ₹1Cr',
    minInvestment: 5000000, maxInvestment: 10000000,
    description: "Authorized dealership for Bajaj Auto — makers of Pulsar, Dominar, and Chetak EV. Strong volume sales with growing EV segment and robust after-sales service revenue streams.",
    image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=1600&auto=format&fit=crop',
    logo: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=100&h=100&auto=format&fit=crop&crop=center',
    location: 'Pan India', is_verified: true, status: 'published',
    owner_uid: 'seed-deal-bajaj', tags: ['bajaj', 'pulsar', 'two-wheeler', 'ev', 'automotive'],
    areaRequired: '2000 - 4000 sq ft', roiMonths: 28, businessModel: 'COCO',
    employees_req: '8 - 14', space_req: '2000 to 4000 sft', presenceCount: '6000+ Outlets',
    breakEvenMonths: 28, tierTarget: 'Tier 2, Tier 3', marketHotness: 'high', trustScore: 93,
    trainingDays: 21, trainingFor: 'Sales + Service Engineers', sopManualGiven: true,
    marketingSupport: 'IPL campaigns, digital, dealer development fund',
    locationsLookingFor: ['Maharashtra', 'Rajasthan', 'Gujarat', 'Karnataka', 'Madhya Pradesh'],
    usp: 'Premium bike + EV brand with India\'s strongest youth appeal', margins: '7-12% gross',
    targetLocations: 'Highways, town centres, industrial areas',
    showroomLayoutReq: 'Bajaj 3S format preferred'
  },
  {
    type: 'dealership',
    brand_name: 'Shree Cement Dealership',
    category: 'Construction',
    investment_range: '₹15L - ₹30L',
    minInvestment: 1500000, maxInvestment: 3000000,
    description: "Authorized dealer for Shree Cement — one of India's top 3 cement manufacturers. High-volume, consistent demand from construction boom in Tier 2 and Tier 3 cities with strong margins.",
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1600&auto=format&fit=crop',
    logo: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?q=80&w=100&h=100&auto=format&fit=crop&crop=center',
    location: 'North & Central India', is_verified: true, status: 'published',
    owner_uid: 'seed-deal-shree', tags: ['cement', 'construction', 'building materials'],
    areaRequired: '500 sq ft warehouse + yard', roiMonths: 18, businessModel: 'FOFO',
    employees_req: '3 - 5', space_req: '500 sft + storage yard', presenceCount: '20,000+ Dealers',
    breakEvenMonths: 18, tierTarget: 'Tier 2, Tier 3', marketHotness: 'medium', trustScore: 88,
    trainingDays: 3, trainingFor: 'Dealer + Sales Rep', sopManualGiven: true,
    marketingSupport: 'Brand materials, digital support, builder events',
    locationsLookingFor: ['Rajasthan', 'Uttar Pradesh', 'Haryana', 'Madhya Pradesh', 'Bihar'],
    usp: 'Top 3 cement brand with high-volume growth in developing markets', margins: '4-8% gross',
    targetLocations: 'Construction material markets, highway sides, industrial areas'
  },

  // ─── DISTRIBUTION ─────────────────────────────────────────────────────────
  {
    type: 'distribution',
    brand_name: 'Amul Distribution',
    category: 'FMCG',
    investment_range: '₹3L - ₹8L',
    minInvestment: 300000, maxInvestment: 800000,
    description: "Distribute India's #1 dairy brand across your territory. Amul's consistent demand, fixed margins, and cooperative model make this the most stable and low-risk FMCG distribution opportunity.",
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=1600&auto=format&fit=crop',
    logo: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=100&h=100&auto=format&fit=crop&crop=center',
    location: 'Pan India', is_verified: true, status: 'published',
    owner_uid: 'seed-dist-amul', tags: ['amul', 'dairy', 'fmcg', 'distribution', 'milk'],
    areaRequired: '300 - 500 sq ft cold storage', roiMonths: 10, businessModel: 'FOFO',
    employees_req: '2 - 3 + delivery staff', space_req: '300 to 500 sft with cold room',
    presenceCount: '1 Million+ Retailers', breakEvenMonths: 10,
    tierTarget: 'Tier 2, Tier 3, Rural', marketHotness: 'high', trustScore: 97,
    trainingDays: 2, trainingFor: 'Distributor', sopManualGiven: true,
    marketingSupport: 'National brand pull, scheme support, van stickers',
    locationsLookingFor: ['Uttar Pradesh', 'Bihar', 'Rajasthan', 'Madhya Pradesh', 'Jharkhand'],
    usp: 'India\'s most trusted dairy brand with guaranteed daily volume', margins: '5-10% gross',
    targetLocations: 'Residential areas, market clusters',
    stockArrivalFrequency: 'Daily', creditPeriodDays: 7,
    deliveryVansRequired: 1, warehouseSqFt: 400
  },
  {
    type: 'distribution',
    brand_name: 'ITC Limited Distribution',
    category: 'FMCG',
    investment_range: '₹5L - ₹10L',
    minInvestment: 500000, maxInvestment: 1000000,
    description: "Exclusive distributor for ITC's FMCG portfolio — Aashirvaad, Sunfeast, Classmate, Engage, and more. High SKU count with strong retailer pull ensures consistent volume and margins.",
    image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?q=80&w=1600&auto=format&fit=crop',
    logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=100&h=100&auto=format&fit=crop&crop=center',
    location: 'Pan India', is_verified: true, status: 'published',
    owner_uid: 'seed-dist-itc', tags: ['itc', 'aashirvaad', 'sunfeast', 'fmcg', 'distribution'],
    areaRequired: '400 - 700 sq ft', roiMonths: 12, businessModel: 'FOFO',
    employees_req: '3 - 5 + delivery staff', space_req: '400 to 700 sft + godown',
    presenceCount: '6 Million+ Retail Touchpoints', breakEvenMonths: 12,
    tierTarget: 'Tier 2, Tier 3', marketHotness: 'medium', trustScore: 92,
    trainingDays: 3, trainingFor: 'Distributor + Sales Staff', sopManualGiven: true,
    marketingSupport: 'Scheme announcements, PoP materials, category planograms',
    locationsLookingFor: ['Uttar Pradesh', 'West Bengal', 'Odisha', 'Bihar', 'Assam'],
    usp: 'Diversified FMCG portfolio with multiple high-demand brands', margins: '6-12% gross',
    targetLocations: 'Semi-urban and rural market clusters',
    stockArrivalFrequency: 'Weekly', creditPeriodDays: 14,
    deliveryVansRequired: 2, warehouseSqFt: 600
  },
  {
    type: 'distribution',
    brand_name: 'Dabur Distribution',
    category: 'Healthcare & FMCG',
    investment_range: '₹4L - ₹8L',
    minInvestment: 400000, maxInvestment: 800000,
    description: "Distribute Dabur's trusted Ayurvedic and healthcare portfolio — Real Juice, Dabur Honey, Chyawanprash, Hajmola, and Vatika. Decades of brand trust translate to reliable off-take.",
    image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=1600&auto=format&fit=crop',
    logo: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=100&h=100&auto=format&fit=crop&crop=center',
    location: 'Pan India', is_verified: true, status: 'published',
    owner_uid: 'seed-dist-dabur', tags: ['dabur', 'ayurveda', 'healthcare', 'fmcg'],
    areaRequired: '300 - 500 sq ft', roiMonths: 11, businessModel: 'FOFO',
    employees_req: '2 - 4 + delivery', space_req: '300 to 500 sft',
    presenceCount: '5 Million+ Retail Outlets', breakEvenMonths: 11,
    tierTarget: 'Tier 2, Tier 3, Rural', marketHotness: 'medium', trustScore: 90,
    trainingDays: 2, trainingFor: 'Distributor', sopManualGiven: true,
    marketingSupport: 'Brand demand, scheme support, seasonal campaigns',
    locationsLookingFor: ['Bihar', 'Uttar Pradesh', 'Rajasthan', 'Madhya Pradesh', 'Jharkhand'],
    usp: '130-year-old Ayurvedic brand with unmatched retailer trust', margins: '7-11% gross',
    targetLocations: 'Pharmacy clusters, general trade markets',
    stockArrivalFrequency: 'Weekly', creditPeriodDays: 14,
    deliveryVansRequired: 1, warehouseSqFt: 450
  },
  {
    type: 'distribution',
    brand_name: 'Haldiram\'s Distribution',
    category: 'Food & Beverage',
    investment_range: '₹5L - ₹10L',
    minInvestment: 500000, maxInvestment: 1000000,
    description: "Exclusive distributor for Haldiram's — India's most iconic snack and namkeen brand. Premium products command strong shelf visibility, impulse purchases, and festive season surges.",
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1600&auto=format&fit=crop',
    logo: 'https://images.unsplash.com/photo-1497888329096-51c27beff665?q=80&w=100&h=100&auto=format&fit=crop&crop=center',
    location: 'North & West India', is_verified: true, status: 'published',
    owner_uid: 'seed-dist-haldi', tags: ['haldirams', 'namkeen', 'snacks', 'fmcg'],
    areaRequired: '400 - 600 sq ft', roiMonths: 13, businessModel: 'FOFO',
    employees_req: '3 - 5 + delivery', space_req: '400 to 600 sft',
    presenceCount: '2 Million+ Retailers', breakEvenMonths: 13,
    tierTarget: 'Tier 2, Tier 3', marketHotness: 'high', trustScore: 89,
    trainingDays: 2, trainingFor: 'Distributor + Team', sopManualGiven: true,
    marketingSupport: 'Brand pull, in-store display support, festive schemes',
    locationsLookingFor: ['Uttar Pradesh', 'Rajasthan', 'Delhi NCR', 'Madhya Pradesh', 'Punjab'],
    usp: 'India\'s most recognized snack brand with unmatched repeat purchase', margins: '8-14% gross',
    targetLocations: 'General trade, modern trade, kirana clusters',
    stockArrivalFrequency: 'Weekly', creditPeriodDays: 10,
    deliveryVansRequired: 1, warehouseSqFt: 500
  },
  {
    type: 'distribution',
    brand_name: 'Hindustan Unilever Distribution',
    category: 'FMCG',
    investment_range: '₹8L - ₹15L',
    minInvestment: 800000, maxInvestment: 1500000,
    description: "Distribution rights for HUL's portfolio — Surf Excel, Lifebuoy, Lux, Dove, Horlicks, and 40+ brands. India's largest FMCG company offers unmatched volume and retailer access.",
    image: 'https://images.unsplash.com/photo-1585664811087-47f65abbad64?q=80&w=1600&auto=format&fit=crop',
    logo: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=100&h=100&auto=format&fit=crop&crop=center',
    location: 'Pan India', is_verified: true, status: 'published',
    owner_uid: 'seed-dist-hul', tags: ['hul', 'lifebuoy', 'surf excel', 'fmcg', 'unilever'],
    areaRequired: '600 - 1000 sq ft', roiMonths: 14, businessModel: 'FOFO',
    employees_req: '4 - 6 + delivery', space_req: '600 to 1000 sft',
    presenceCount: '8 Million+ Retailer Network', breakEvenMonths: 14,
    tierTarget: 'Tier 2, Tier 3, Rural', marketHotness: 'high', trustScore: 96,
    trainingDays: 5, trainingFor: 'Distributor + Sales Force', sopManualGiven: true,
    marketingSupport: 'Shakti program, digital salesforce tools, trade marketing',
    locationsLookingFor: ['Uttar Pradesh', 'Bihar', 'West Bengal', 'Odisha', 'Assam'],
    usp: 'India\'s largest FMCG company — guaranteed volume across all seasons', margins: '5-10% gross',
    targetLocations: 'Rural haats, semi-urban market clusters',
    stockArrivalFrequency: 'Weekly', creditPeriodDays: 14,
    deliveryVansRequired: 2, warehouseSqFt: 800
  }
];

const influencers = [
  { name: 'Guru Enterprises', code: 'GURU20', email: 'guru@bharatbrand.in', totalLeads: 85, totalConversions: 18, earnings: 28500, paymentStatus: 'paid' },
  { name: 'King Affiliates', code: 'KING50', email: 'king@bharatbrand.in', totalLeads: 142, totalConversions: 31, earnings: 52000, paymentStatus: 'paid' },
  { name: 'Bharat Franchise Network', code: 'BFN100', email: 'bfn@bharatbrand.in', totalLeads: 210, totalConversions: 47, earnings: 78500, paymentStatus: 'pending' }
];

export const seedDatabase = async (): Promise<void> => {
  try {
    const oppCount = await Opportunity.countDocuments();
    // Reseed if empty OR if old minimal seed data is present (< 10 records)
    if (oppCount < 10) {
      if (oppCount > 0) {
        console.log(`🗑️  Replacing ${oppCount} old seed records with production data...`);
        await Opportunity.deleteMany({});
      } else {
        console.log('🌱 Seeding initial opportunities...');
      }
      await Opportunity.insertMany(opportunities);
      console.log(`✅ Seeded ${opportunities.length} opportunities`);
    }

    const infCount = await Influencer.countDocuments();
    if (infCount === 0) {
      console.log('🌱 Seeding initial influencers...');
      await Influencer.insertMany(influencers);
      console.log(`✅ Seeded ${influencers.length} influencers`);
    }
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
};

export const initAdminUser = async (): Promise<void> => {
  const adminEmail = 'kothapallivijaykumar02@gmail.com';
  try {
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      // Ensure role is admin in DB
      if (existing.role !== 'admin') {
        await User.findByIdAndUpdate(existing._id, { role: 'admin' });
        console.log('✅ Admin role upgraded for', adminEmail);
      }
      return;
    }
    await User.create({
      name: 'Vijay Kumar',
      email: adminEmail,
      password: 'Vijaykumar',
      role: 'admin',
      is_verified: true,
      createdAt: new Date().toISOString()
    });
    console.log('✅ Admin user created:', adminEmail);
  } catch (error) {
    console.error('❌ Admin init error:', error);
  }
};

export const clearAndReseed = async (): Promise<void> => {
  console.log('🗑️  Wiping existing data...');
  await Opportunity.deleteMany({});
  await Influencer.deleteMany({});
  console.log('✅ Collections cleared');

  console.log('🌱 Reseeding with fresh production data...');
  await Opportunity.insertMany(opportunities);
  await Influencer.insertMany(influencers);
  console.log(`✅ Reseeded: ${opportunities.length} opportunities, ${influencers.length} influencers`);
};
