
import { nanoid } from 'nanoid';
import type { Subject } from './types';

// Helper function to create topics
const createTopics = (names: string[]) => names.map(name => ({ id: nanoid(), name }));

// Helper function to create chapters
const createChapters = (chapters: { name: string; topics: string[] }[]) =>
  chapters.map(chapter => ({
    id: nanoid(),
    name: chapter.name,
    topics: createTopics(chapter.topics),
  }));

const subjects: Omit<Subject, 'id' | 'totalChapters'>[] = [
  // 1. Bangla 1st Paper
  {
    name: 'Bangla 1st Paper',
    color: '#D32F2F',
    order: 1,
    chapters: createChapters([
      { name: 'গদ্য (Godyo)', topics: ['অপরিচিতা', 'বিলাসী', 'আমার পথ', 'মানব-কল্যাণ', 'মাসি-পিসি', 'বায়ান্নর দিনগুলো', 'রেইনকোট', 'মহাজাগতিক ക്യുರೇಟರ್', 'নেকলেস', 'ঐקתান'] },
      { name: 'পদ্য (Podyo)', topics: ['বিভীষণের প্রতি মেঘনাদ', 'সোনার তরী', ' विद्रोहী', 'প্রতিদান', 'تازমহল', 'সেই অস্ত্র', 'ফেব্রুয়ারি ১৯৬৯', 'আমি কিংবদন্তির কথা বলছি', 'নورালদীনের কথা মনে পড়ে যায়', 'ছবি'] },
      { name: 'উপন্যাস (Uponnash)', topics: ['লালসালু'] },
      { name: 'নাটক (Natok)', topics: ['সিরাজউদ্দৌলা'] },
    ]),
  },
  // 2. Bangla 2nd Paper
  {
    name: 'Bangla 2nd Paper',
    color: '#C2185B',
    order: 2,
    chapters: createChapters([
        { name: 'ব্যাকরণ (Byakoron)', topics: ['বাংলা উচ্চারণের নিয়ম', 'বাংলা বানানের নিয়ম', 'বাংলা ভাষার ব্যাকরণিক শব্দश्रेণি', ' উপসর্গ, প্রত্যয় ও समास', ' वाक्यতত্ত্ব', 'বাংলা ভাষার অপপ্রয়োগ ও শুদ্ধ প্রয়োগ'] },
        { name: 'নির্মিতি (Nirmiti)', topics: ['पारিভাষিক শব্দ ও অনুবাদ', 'দিনলিপি লিখন', 'বৈദ്യুতিক চিঠি', 'भाषण রচনা', 'প্রতিবেদন রচনা', 'สารাংশ লিখন'] },
    ]),
  },
  // 3. English 1st Paper
  {
    name: 'English 1st Paper',
    color: '#7B1FA2',
    order: 3,
    chapters: createChapters([
      { name: 'Unit-1: People or Institutions Making History', topics: ["The Unforgettable History", "Nelson Mandela, from Apartheid Fighter to President", "Two Women"] },
      { name: 'Unit-2: Greatest Scientific Achievements', topics: ["The Scientific Breakthroughs We Are Waiting For", "Tribute to a Great Scientist"] },
      { name: 'Unit-3: Dreams', topics: ["What is a Dream?", "I Have a Dream"] },
      { name: 'Unit-4: Human Relationships', topics: ["Etiquette and Manners", "Love and Friendship"] },
      { name: 'Unit-5: Adolescence', topics: ["The Storm and Stress of Adolescence", "Why Does a Child Hate School?"] },
      { name: 'Unit-6: The Art of Living', topics: ["The Art of Living", "What is Art?"] },
      { name: 'Unit-7: Environment and Nature', topics: ["Water, Water Everywhere", "Threats to Tigers"] },
      { name": 'Unit-8: Human Rights', topics: ["Are We Aware of Our Rights?", "Rights of the Child"] },
      { name: 'Unit-9: Diaspora', topics: ["What is Diaspora?", "Bangladeshi Diaspora"] },
      { name: 'Unit-10: Peace and Conflict', topics: ["What is Peace?", "The Art of War"] },
      { name: 'Unit-11: Tours and Travels', topics: ["Travelling to a Village in Bangladesh", "The Wonders of the World"] },
      { name: 'Unit-12: Food Adulteration', topics: ["Food Adulteration Reaches New Height", "Eating Habits and Hazards"] },
    ]),
  },
  // 4. English 2nd Paper
  {
    name: 'English 2nd Paper',
    color: '#512DA8',
    order: 4,
    chapters: createChapters([
      { name: 'Grammar Part A', topics: ['Articles', 'Prepositions', 'Special Uses of words/phrases', 'Completing Sentences', 'Right form of Verbs', 'Narration', 'Pronoun Reference', 'Modifiers', 'Connectors', 'Synonyms & Antonyms', 'Punctuation'] },
      { name: 'Composition Part B', topics: ['Formal Letter/Email Writing', 'Report Writing', 'Paragraph Writing', 'Free Writing'] },
    ]),
  },
  // 5. ICT
  {
    name: 'Information and Communication Technology (ICT)',
    color: '#303F9F',
    order: 5,
    chapters: createChapters([
      { name: 'Chapter 1: Information and Communication Technology: World and Bangladesh Perspective', topics: ['Concept of World Village', 'Virtual Reality', 'Artificial Intelligence', 'Robotics', 'Cryosurgery', 'Biometrics', 'Bioinformatics', 'Genetic Engineering', 'Nanotechnology'] },
      { name: 'Chapter 2: Communication Systems and Networking', topics: ['Communication Systems', 'Data Transmission', 'Network Concepts', 'Network Devices', 'Cloud Computing'] },
      { name: 'Chapter 3: Number Systems and Digital Devices', topics: ['Number Systems', 'Logic Gates', 'Encoder & Decoder', 'Adder', 'Flip-Flop & Registers'] },
      { name: 'Chapter 4: Introduction to Web Design and HTML', topics: ['Concepts of Website', 'HTML Fundamentals', 'HTML Formatting', 'Hyperlinks', 'Images', 'Tables', 'Website Structure'] },
      { name: 'Chapter 5: Programming Language', topics: ['Concepts of Programming Language', 'Algorithm & Flowchart', 'Programming in C', 'Data Types, Variables, Constants', 'Operators & Expressions', 'Control Structures (if, else, loops)', 'Arrays', 'Functions'] },
      { name: 'Chapter 6: Database Management System', topics: ['Database Concepts', 'DBMS & RDBMS', 'Data Models', 'SQL', 'Database Security'] },
    ]),
  },
  // 6. Physics 1st Paper
  {
    name: 'Physics 1st Paper',
    color: '#0288D1',
    order: 6,
    chapters: createChapters([
      { name: 'Chapter 1: Physical World and Measurement', topics: ['Fundamental and Derived Quantities', 'Units and Dimensions', 'Errors in Measurement', 'Vernier Scale and Screw Gauge'] },
      { name: 'Chapter 2: Vectors', topics: ['Scalar and Vector Quantities', 'Vector Addition and Subtraction', 'Resolution of Vectors', 'Dot and Cross Product', 'Vector Calculus (Gradient, Divergence, Curl)'] },
      { name: 'Chapter 3: Dynamics', topics: ['Newton\'s Laws of Motion', 'Force, Momentum, Impulse', 'Friction', 'Work, Power, Energy', 'Conservation of Energy and Momentum', 'Circular Motion', 'Centripetal and Centrifugal Force'] },
      { name: 'Chapter 4: Newtonian Mechanics', topics: ['Projectile Motion', 'Rotational Motion', 'Torque, Angular Momentum', 'Moment of Inertia', 'Conservation of Angular Momentum'] },
      { name: 'Chapter 5: Work, Energy and Power', topics: ['Work-Energy Theorem', 'Potential and Kinetic Energy', 'Conservative and Non-conservative Forces', 'Power'] },
      { name: 'Chapter 6: Gravitation and Gravity', topics: ['Newton\'s Law of Gravitation', 'Gravitational Field and Potential', 'Escape Velocity', 'Kepler\'s Laws', 'Satellites'] },
      { name: 'Chapter 7: Structural Properties of Matter', topics: ['Elasticity', 'Hooke\'s Law', 'Poisson\'s Ratio', 'Surface Tension', 'Viscosity', 'Stokes\' Law'] },
      { name: 'Chapter 8: Periodic Motion', topics: ['Simple Harmonic Motion (SHM)', 'Simple Pendulum', 'Damped and Forced Oscillation', 'Resonance'] },
      { name: 'Chapter 9: Waves', topics: ['Transverse and Longitudinal Waves', 'Superposition of Waves', 'Interference', 'Beats', 'Stationary Waves', 'Doppler Effect'] },
      { name: 'Chapter 10: Ideal Gas and Gas Dynamics', topics: ['Boyle\'s Law, Charles\' Law', 'Ideal Gas Equation', 'Kinetic Theory of Gases', 'RMS Velocity', 'Mean Free Path', 'First Law of Thermodynamics'] },
    ]),
  },
  // 7. Physics 2nd Paper
  {
    name: 'Physics 2nd Paper',
    color: '#0097A7',
    order: 7,
    chapters: createChapters([
      { name: 'Chapter 1: Thermodynamics', topics: ['Thermal Properties of Matter', 'Zeroth, First and Second Law of Thermodynamics', 'Entropy', 'Carnot Engine', 'Refrigerator'] },
      { name: 'Chapter 2: Static Electricity', topics: ['Charge', 'Coulomb\'s Law', 'Electric Field and Potential', 'Gauss\'s Law', 'Capacitors and Capacitance'] },
      { name: 'Chapter 3: Current Electricity', topics: ['Ohm\'s Law', 'Kirchhoff\'s Laws', 'Resistors in Series and Parallel', 'Wheatstone Bridge', 'Potentiometer', 'Heating Effect of Current'] },
      { name: 'Chapter 4: Magnetic Effect of Current and Magnetism', topics: ['Magnetic Field', 'Biot-Savart Law', 'Ampere\'s Law', 'Lorentz Force', 'Hall Effect', 'Magnetic Materials'] },
      { name: 'Chapter 5: Electromagnetic Induction and Alternating Current', topics: ['Faraday\'s Laws of Induction', 'Lenz\'s Law', 'Self and Mutual Induction', 'AC Circuits (R, L, C, RLC)', 'Resonance', 'Transformer'] },
      { name: 'Chapter 6: Geometrical Optics', topics: ['Reflection and Refraction of Light', 'Lenses', 'Prism', 'Optical Instruments (Microscope, Telescope)'] },
      { name: 'Chapter 7: Physical Optics', topics: ['Huygens\' Principle', 'Interference (Young\'s Double Slit)', 'Diffraction (Single Slit)', 'Polarization'] },
      { name: 'Chapter 8: Introduction to Modern Physics', topics: ['Special Theory of Relativity', 'Photoelectric Effect', 'Compton Effect', 'De Broglie Waves', 'Heisenberg\'s Uncertainty Principle'] },
      { name: 'Chapter 9: Atomic Model and Nuclear Physics', topics: ['Rutherford and Bohr Model', 'X-rays', 'Radioactivity', 'Nuclear Fission and Fusion', 'Nuclear Reactor'] },
      { name: 'Chapter 10: Semiconductors and Electronics', topics: ['Semiconductors', 'P-N Junction Diode', 'Transistor', 'Logic Gates', 'Communication Systems'] },
    ]),
  },
  // 8. Chemistry 1st Paper
  {
    name: 'Chemistry 1st Paper',
    color: '#F57C00',
    order: 8,
    chapters: createChapters([
      { name: 'Chapter 1: Laboratory Safety Procedures', topics: ['Lab safety rules', 'Use of chemical substances', 'First aid'] },
      { name: 'Chapter 2: Qualitative Chemistry', topics: ['Concept of mole', 'Stoichiometry', 'Concentration of solutions', 'Titration', 'Principles of qualitative analysis'] },
      { name: 'Chapter 3: Periodic Properties and Chemical Bonding', topics: ['Periodic classification', 'Atomic properties', 'Types of chemical bonds', 'VSEPR theory', 'Hybridization', 'Hydrogen bond'] },
      { name: 'Chapter 4: Chemical Changes', topics: ['Reaction rates', 'Factors affecting reaction rates', 'Chemical equilibrium', 'Acids and bases', 'pH and buffer solutions', 'Redox reactions'] },
      { name: 'Chapter 5: Working Chemistry', topics: ['Food preservation', 'Cleaning agents', 'Vinegar production', 'Nanoparticles'] },
    ]),
  },
  // 9. Chemistry 2nd Paper
  {
    name: 'Chemistry 2nd Paper',
    color: '#E64A19',
    order: 9,
    chapters: createChapters([
      { name: 'Chapter 1: Environmental Chemistry', topics: ['Gases and their properties', 'Acid rain', 'Greenhouse effect', 'Ozone layer depletion', 'Water pollution and treatment'] },
      { name: 'Chapter 2: Organic Chemistry', topics: ['Classification and nomenclature', 'Isomerism', 'Alkanes, Alkenes, Alkynes', 'Aromatic compounds (Benzene)', 'Alcohols, Phenols, Ethers', 'Aldehydes and Ketones', 'Carboxylic acids', 'Amines', 'Polymers'] },
      { name: 'Chapter 3: Quantitative Chemistry', topics: ['Titration', 'Gravimetric analysis', 'Electrochemical cells', 'Faraday\'s laws of electrolysis', 'pH and conductivity'] },
      { name: 'Chapter 4: Electrochemistry', topics: ['Electrolytic and galvanic cells', 'Standard electrode potential', 'Nernst equation', 'Batteries', 'Corrosion'] },
      { name: 'Chapter 5: Economic Chemistry', topics: ['Industrial production of urea, ammonia', 'Cement industry', 'Pulp and paper industry', 'Ceramics', 'Leather tanning'] },
    ]),
  },
  // 10. Biology 1st Paper
  {
    name: 'Biology 1st Paper',
    color: '#388E3C',
    order: 10,
    chapters: createChapters([
      { name: 'Chapter 1: Cell and its Structure', topics: ['Cell theory', 'Prokaryotic and Eukaryotic cells', 'Cell organelles', 'Cell division (Mitosis, Meiosis)'] },
      { name: 'Chapter 2: Cell Division', topics: ['Amitosis', 'Mitosis', 'Meiosis', 'Significance of cell division'] },
      { name: 'Chapter 3: Cell Chemistry', topics: ['Carbohydrates', 'Proteins', 'Lipids', 'Nucleic acids (DNA, RNA)', 'Enzymes'] },
      { name: 'Chapter 4: Microorganisms', topics: ['Viruses', 'Bacteria', 'Fungi', 'Malaria parasite'] },
      { name: 'Chapter 5: Algae and Fungi', topics: ['Classification and characteristics', 'Economic importance of algae and fungi'] },
      { name: 'Chapter 6: Bryophyta and Pteridophyta', topics: ['Characteristics and classification', 'Life cycle (Riccia, Pteris)'] },
      { name: 'Chapter 7: Gymnosperms and Angiosperms', topics: ['Characteristics', 'Classification', 'Life cycle of Cycas and a typical angiosperm'] },
      { name: 'Chapter 8: Tissue and Tissue System', topics: ['Plant tissues', 'Vascular bundles', 'Root, stem, and leaf anatomy'] },
      { name: 'Chapter 9: Plant Physiology', topics: ['Photosynthesis', 'Respiration', 'Transpiration', 'Plant hormones'] },
      { name: 'Chapter 10: Plant Breeding', topics: ['Asexual and sexual reproduction', 'Pollination', 'Fertilization', 'Biotechnology in plant breeding'] },
      { name: 'Chapter 11: Biotechnology', topics: ['Recombinant DNA technology', 'Genetic engineering', 'Tissue culture', 'Applications of biotechnology'] },
    ]),
  },
  // 11. Biology 2nd Paper
  {
    name: 'Biology 2nd Paper',
    color: '#689F38',
    order: 11,
    chapters: createChapters([
      { name: 'Chapter 1: Animal Diversity and Classification', topics: ['Basis of classification', 'Major phyla of Animalia', 'Chordates'] },
      { name: 'Chapter 2: Introduction to Animals', topics: ['Cockroach', 'Rui fish', 'Hydra'] },
      { name: 'Chapter 3: Digestion and Absorption', topics: ['Human digestive system', 'Process of digestion and absorption'] },
      { name'Chapter 4: Respiration and Gas Exchange', topics: ['Human respiratory system', 'Mechanism of breathing', 'Gas exchange'] },
      { name: 'Chapter 5: Circulation', topics: ['Human circulatory system', 'Blood and its components', 'Heart structure and function', 'Blood groups'] },
      { name: 'Chapter 6: Excretion and Osmoregulation', topics: ['Human excretory system', 'Structure and function of kidney', 'Urine formation'] },
      { name: 'Chapter 7: Locomotion and Movement', topics: ['Human skeletal system', 'Muscles and their function', 'Joints'] },
      { name: 'Chapter 8: Coordination and Control', topics: ['Nervous system (Brain, spinal cord)', 'Endocrine system and hormones'] },
      { name: 'Chapter 9: Reproduction', topics: ['Human reproductive systems (male and female)', 'Gametogenesis', 'Menstrual cycle', 'Fertilization'] },
      { name: 'Chapter 10: Genetics and Evolution', topics: ['Mendel\'s laws', 'DNA as genetic material', 'Theories of evolution', 'Human genetic disorders'] },
      { name: 'Chapter 11: Animal Behavior', topics: ['Innate and learned behavior', 'Social behavior'] },
    ]),
  },
  // 12. Higher Math 1st Paper
  {
    name: 'Higher Math 1st Paper',
    color: '#6A1B9A',
    order: 12,
    chapters: createChapters([
      { name: 'Chapter 1: Matrices and Determinants', topics: ['Matrices', 'Determinants', 'Inverse of a matrix', 'Solving linear equations'] },
      { name: 'Chapter 2: Vectors', topics: ['Vector algebra', 'Scalar and vector products', 'Applications of vectors'] },
      { name: 'Chapter 3: Straight Lines', topics: ['Coordinate systems', 'Equations of straight lines', 'Angle between lines'] },
      { name: 'Chapter 4: Circles', topics: ['Equation of a circle', 'Tangents and normals'] },
      { name: 'Chapter 5: Permutations and Combinations', topics: ['Fundamental principles of counting', 'Permutations', 'Combinations'] },
      { name: 'Chapter 6: Trigonometric Ratios', topics: ['Associated angles', 'Compound angles', 'Multiple and sub-multiple angles'] },
      { name: 'Chapter 7: Trigonometric Equations', topics: ['General solutions of trigonometric equations'] },
      { name: 'Chapter 8: Functions and Graphs of Functions', topics: ['Domain and range', 'Types of functions', 'Graphs of functions'] },
      { name: 'Chapter 9: Differentiation', topics: ['Limits and continuity', 'Derivatives of functions', 'Applications of derivatives'] },
      { name: 'Chapter 10: Integration', topics: ['Indefinite and definite integrals', 'Methods of integration', 'Applications of integration'] },
    ]),
  },
  // 13. Higher Math 2nd Paper
  {
    name: 'Higher Math 2nd Paper',
    color: '#4527A0',
    order: 13,
    chapters: createChapters([
      { name: 'Chapter 1: Real Numbers and Inequalities', topics: ['Properties of real numbers', 'Inequalities'] },
      { name: 'Chapter 2: Linear Programming', topics: ['Formulation and graphical solution of LPP'] },
      { name: 'Chapter 3: Complex Numbers', topics: ['Argand diagram', 'Modulus and argument', 'De Moivre\'s theorem'] },
      { name: 'Chapter 4: Polynomials and Polynomial Equations', topics: ['Remainder theorem', 'Factor theorem', 'Roots of equations'] },
      { name: 'Chapter 5: Binomial Expansion', topics: ['Binomial theorem for any index'] },
      { name: tóChapter 6: Conics', topics: ['Parabola', 'Ellipse', 'Hyperbola'] },
      { name: 'Chapter 7: Inverse Trigonometric Functions and Equations', topics: ['Properties and graphs', 'Solving equations'] },
      { name: 'Chapter 8: Statics', topics: ['Forces in equilibrium', 'Moments', 'Couples'] },
      { name: 'Chapter 9: Dynamics', topics: ['Motion in a straight line', 'Projectiles', 'SHM'] },
      { name: 'Chapter 10: Probability', topics: ['Basic concepts', 'Conditional probability', 'Binomial distribution'] },
    ]),
  },
];


export const NCTB_HSC_SYLLABUS: Subject[] = subjects.map(subject => {
    const chapters = subject.chapters;
    return {
        ...subject,
        id: nanoid(),
        totalChapters: chapters.length,
        chapters: chapters
    }
});
