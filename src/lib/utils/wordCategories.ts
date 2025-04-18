export interface WordCategory {
  name: string;
  examples: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export const WORD_CATEGORIES: WordCategory[] = [
  {
    name: 'Sports',
    examples: ['basketball', 'swimming', 'tennis', 'soccer', 'volleyball'],
    difficulty: 'easy'
  },
  {
    name: 'Food',
    examples: ['pizza', 'sushi', 'hamburger', 'pasta', 'chocolate'],
    difficulty: 'easy'
  },
  {
    name: 'Animals',
    examples: ['elephant', 'penguin', 'giraffe', 'dolphin', 'kangaroo'],
    difficulty: 'easy'
  },
  {
    name: 'Jobs',
    examples: ['teacher', 'doctor', 'chef', 'firefighter', 'artist'],
    difficulty: 'easy'
  },
  {
    name: 'Hobbies',
    examples: ['painting', 'gardening', 'photography', 'dancing', 'cooking'],
    difficulty: 'medium'
  },
  {
    name: 'Places',
    examples: ['beach', 'mountain', 'library', 'park', 'museum'],
    difficulty: 'medium'
  },
  {
    name: 'Entertainment',
    examples: ['movie', 'concert', 'theater', 'circus', 'festival'],
    difficulty: 'medium'
  },
  {
    name: 'Technology',
    examples: ['computer', 'smartphone', 'robot', 'internet', 'satellite'],
    difficulty: 'hard'
  },
  {
    name: 'Nature',
    examples: ['rainbow', 'waterfall', 'volcano', 'forest', 'ocean'],
    difficulty: 'medium'
  },
  {
    name: 'Emotions',
    examples: ['happy', 'excited', 'surprised', 'nervous', 'peaceful'],
    difficulty: 'hard'
  },
  {
    name: 'Musical Instruments',
    examples: ['guitar', 'piano', 'drums', 'violin', 'flute'],
    difficulty: 'easy'
  },
  {
    name: 'Weather',
    examples: ['rain', 'snow', 'thunder', 'sunshine', 'wind'],
    difficulty: 'easy'
  },
  {
    name: 'Vehicles',
    examples: ['car', 'bicycle', 'airplane', 'boat', 'train'],
    difficulty: 'easy'
  },
  {
    name: 'Clothing',
    examples: ['shirt', 'pants', 'dress', 'shoes', 'hat'],
    difficulty: 'easy'
  },
  {
    name: 'Colors',
    examples: ['red', 'blue', 'green', 'yellow', 'purple'],
    difficulty: 'easy'
  },
  {
    name: 'School Subjects',
    examples: ['math', 'science', 'history', 'english', 'art'],
    difficulty: 'easy'
  },
  {
    name: 'Body Parts',
    examples: ['head', 'arm', 'leg', 'foot', 'hand'],
    difficulty: 'easy'
  },
  {
    name: 'Furniture',
    examples: ['chair', 'table', 'bed', 'couch', 'desk'],
    difficulty: 'easy'
  },
  {
    name: 'Kitchen Items',
    examples: ['spoon', 'plate', 'cup', 'knife', 'pan'],
    difficulty: 'easy'
  },
  {
    name: 'Fruits',
    examples: ['apple', 'banana', 'orange', 'grape', 'strawberry'],
    difficulty: 'easy'
  },
  {
    name: 'Vegetables',
    examples: ['carrot', 'broccoli', 'potato', 'tomato', 'cucumber'],
    difficulty: 'easy'
  },
  {
    name: 'Countries',
    examples: ['france', 'japan', 'brazil', 'egypt', 'canada'],
    difficulty: 'medium'
  },
  {
    name: 'Languages',
    examples: ['english', 'spanish', 'chinese', 'arabic', 'french'],
    difficulty: 'medium'
  },
  {
    name: 'Holidays',
    examples: ['christmas', 'halloween', 'easter', 'thanksgiving', 'diwali'],
    difficulty: 'medium'
  },
  {
    name: 'Tools',
    examples: ['hammer', 'screwdriver', 'wrench', 'saw', 'drill'],
    difficulty: 'medium'
  },
  {
    name: 'Insects',
    examples: ['butterfly', 'ant', 'spider', 'bee', 'ladybug'],
    difficulty: 'easy'
  },
  {
    name: 'Birds',
    examples: ['eagle', 'parrot', 'owl', 'peacock', 'penguin'],
    difficulty: 'easy'
  },
  {
    name: 'Sea Creatures',
    examples: ['shark', 'whale', 'octopus', 'starfish', 'jellyfish'],
    difficulty: 'medium'
  },
  {
    name: 'Dinosaurs',
    examples: ['tyrannosaurus', 'triceratops', 'velociraptor', 'stegosaurus', 'brachiosaurus'],
    difficulty: 'hard'
  },
  {
    name: 'Mythical Creatures',
    examples: ['dragon', 'unicorn', 'phoenix', 'mermaid', 'griffin'],
    difficulty: 'medium'
  },
  {
    name: 'Space Objects',
    examples: ['planet', 'star', 'comet', 'asteroid', 'galaxy'],
    difficulty: 'medium'
  },
  {
    name: 'Desserts',
    examples: ['cake', 'ice cream', 'cookie', 'pie', 'brownie'],
    difficulty: 'easy'
  },
  {
    name: 'Beverages',
    examples: ['coffee', 'tea', 'juice', 'soda', 'water'],
    difficulty: 'easy'
  },
  {
    name: 'Fast Food',
    examples: ['burger', 'fries', 'pizza', 'hotdog', 'taco'],
    difficulty: 'easy'
  },
  {
    name: 'Breakfast Foods',
    examples: ['pancake', 'waffle', 'cereal', 'eggs', 'bacon'],
    difficulty: 'easy'
  },
  {
    name: 'Office Supplies',
    examples: ['pencil', 'paper', 'stapler', 'scissors', 'ruler'],
    difficulty: 'easy'
  },
  {
    name: 'Art Supplies',
    examples: ['paint', 'brush', 'canvas', 'crayon', 'marker'],
    difficulty: 'easy'
  },
  {
    name: 'Sports Equipment',
    examples: ['ball', 'bat', 'racket', 'helmet', 'goal'],
    difficulty: 'easy'
  },
  {
    name: 'Exercise Activities',
    examples: ['running', 'yoga', 'swimming', 'cycling', 'weightlifting'],
    difficulty: 'medium'
  },
  {
    name: 'Dance Styles',
    examples: ['ballet', 'jazz', 'hiphop', 'salsa', 'tango'],
    difficulty: 'medium'
  },
  {
    name: 'Music Genres',
    examples: ['rock', 'jazz', 'pop', 'classical', 'hiphop'],
    difficulty: 'medium'
  },
  {
    name: 'Movie Genres',
    examples: ['action', 'comedy', 'horror', 'drama', 'romance'],
    difficulty: 'medium'
  },
  {
    name: 'Book Genres',
    examples: ['mystery', 'fantasy', 'biography', 'romance', 'thriller'],
    difficulty: 'medium'
  },
  {
    name: 'Famous Authors',
    examples: ['shakespeare', 'rowling', 'tolkien', 'dickens', 'twain'],
    difficulty: 'hard'
  },
  {
    name: 'Famous Artists',
    examples: ['picasso', 'vangogh', 'davinci', 'monet', 'dali'],
    difficulty: 'hard'
  },
  {
    name: 'Famous Scientists',
    examples: ['einstein', 'newton', 'darwin', 'tesla', 'curie'],
    difficulty: 'hard'
  },
  {
    name: 'Historical Figures',
    examples: ['napoleon', 'cleopatra', 'gandhi', 'columbus', 'lincoln'],
    difficulty: 'hard'
  },
  {
    name: 'Superheroes',
    examples: ['superman', 'batman', 'spiderman', 'wonderwoman', 'ironman'],
    difficulty: 'medium'
  },
  {
    name: 'Video Game Characters',
    examples: ['mario', 'sonic', 'pikachu', 'link', 'pacman'],
    difficulty: 'medium'
  },
  {
    name: 'Cartoon Characters',
    examples: ['spongebob', 'mickey', 'bugs bunny', 'homer simpson', 'scooby doo'],
    difficulty: 'medium'
  },
  {
    name: 'Fairy Tale Characters',
    examples: ['cinderella', 'snowwhite', 'rapunzel', 'pinocchio', 'peter pan'],
    difficulty: 'medium'
  },
  {
    name: 'Ancient Civilizations',
    examples: ['egypt', 'rome', 'greece', 'maya', 'aztec'],
    difficulty: 'hard'
  },
  {
    name: 'Famous Landmarks',
    examples: ['eiffel tower', 'taj mahal', 'pyramids', 'great wall', 'statue of liberty'],
    difficulty: 'medium'
  },
  {
    name: 'Natural Wonders',
    examples: ['grand canyon', 'niagara falls', 'mount everest', 'great barrier reef', 'aurora borealis'],
    difficulty: 'hard'
  },
  {
    name: 'Gemstones',
    examples: ['diamond', 'ruby', 'emerald', 'sapphire', 'pearl'],
    difficulty: 'medium'
  },
  {
    name: 'Elements',
    examples: ['gold', 'silver', 'iron', 'copper', 'oxygen'],
    difficulty: 'hard'
  },
  {
    name: 'Chemical Compounds',
    examples: ['water', 'salt', 'sugar', 'carbon dioxide', 'methane'],
    difficulty: 'hard'
  },
  {
    name: 'Medical Terms',
    examples: ['fever', 'headache', 'fracture', 'allergy', 'infection'],
    difficulty: 'hard'
  },
  {
    name: 'Computer Terms',
    examples: ['software', 'hardware', 'database', 'algorithm', 'network'],
    difficulty: 'hard'
  },
  {
    name: 'Internet Terms',
    examples: ['website', 'email', 'browser', 'wifi', 'password'],
    difficulty: 'medium'
  },
  {
    name: 'Social Media',
    examples: ['facebook', 'twitter', 'instagram', 'youtube', 'tiktok'],
    difficulty: 'easy'
  },
  {
    name: 'Mobile Apps',
    examples: ['whatsapp', 'snapchat', 'uber', 'spotify', 'netflix'],
    difficulty: 'easy'
  },
  {
    name: 'Operating Systems',
    examples: ['windows', 'macos', 'linux', 'android', 'ios'],
    difficulty: 'medium'
  },
  {
    name: 'Programming Languages',
    examples: ['python', 'javascript', 'java', 'ruby', 'swift'],
    difficulty: 'hard'
  },
  {
    name: 'Web Technologies',
    examples: ['html', 'css', 'react', 'angular', 'nodejs'],
    difficulty: 'hard'
  },
  {
    name: 'Cryptocurrencies',
    examples: ['bitcoin', 'ethereum', 'dogecoin', 'litecoin', 'ripple'],
    difficulty: 'hard'
  },
  {
    name: 'Financial Terms',
    examples: ['stock', 'bond', 'dividend', 'investment', 'mortgage'],
    difficulty: 'hard'
  },
  {
    name: 'Business Terms',
    examples: ['profit', 'revenue', 'marketing', 'budget', 'strategy'],
    difficulty: 'hard'
  },
  {
    name: 'Legal Terms',
    examples: ['contract', 'lawsuit', 'evidence', 'verdict', 'attorney'],
    difficulty: 'hard'
  },
  {
    name: 'Political Terms',
    examples: ['democracy', 'election', 'parliament', 'constitution', 'vote'],
    difficulty: 'hard'
  },
  {
    name: 'Military Terms',
    examples: ['soldier', 'general', 'tank', 'missile', 'submarine'],
    difficulty: 'medium'
  },
  {
    name: 'Space Exploration',
    examples: ['astronaut', 'rocket', 'spacecraft', 'satellite', 'telescope'],
    difficulty: 'medium'
  },
  {
    name: 'Environmental Terms',
    examples: ['recycling', 'pollution', 'ecosystem', 'biodiversity', 'sustainability'],
    difficulty: 'hard'
  },
  {
    name: 'Climate Terms',
    examples: ['temperature', 'humidity', 'pressure', 'precipitation', 'atmosphere'],
    difficulty: 'hard'
  },
  {
    name: 'Natural Disasters',
    examples: ['earthquake', 'hurricane', 'tornado', 'tsunami', 'volcano'],
    difficulty: 'medium'
  },
  {
    name: 'Geological Features',
    examples: ['mountain', 'valley', 'canyon', 'plateau', 'glacier'],
    difficulty: 'medium'
  },
  {
    name: 'Water Bodies',
    examples: ['ocean', 'river', 'lake', 'sea', 'waterfall'],
    difficulty: 'easy'
  },
  {
    name: 'Weather Phenomena',
    examples: ['rainbow', 'lightning', 'fog', 'frost', 'hail'],
    difficulty: 'medium'
  },
  {
    name: 'Seasons',
    examples: ['spring', 'summer', 'autumn', 'winter', 'monsoon'],
    difficulty: 'easy'
  },
  {
    name: 'Time Periods',
    examples: ['morning', 'afternoon', 'evening', 'night', 'dawn'],
    difficulty: 'easy'
  },
  {
    name: 'Calendar Terms',
    examples: ['month', 'week', 'day', 'year', 'century'],
    difficulty: 'easy'
  },
  {
    name: 'Measurements',
    examples: ['meter', 'kilogram', 'liter', 'degree', 'mile'],
    difficulty: 'medium'
  },
  {
    name: 'Shapes',
    examples: ['circle', 'square', 'triangle', 'rectangle', 'pentagon'],
    difficulty: 'easy'
  },
  {
    name: 'Colors Advanced',
    examples: ['turquoise', 'magenta', 'indigo', 'maroon', 'chartreuse'],
    difficulty: 'hard'
  },
  {
    name: 'Patterns',
    examples: ['stripes', 'polka dots', 'plaid', 'chevron', 'floral'],
    difficulty: 'medium'
  },
  {
    name: 'Textures',
    examples: ['smooth', 'rough', 'soft', 'hard', 'bumpy'],
    difficulty: 'medium'
  },
  {
    name: 'Materials',
    examples: ['wood', 'metal', 'plastic', 'glass', 'fabric'],
    difficulty: 'easy'
  },
  {
    name: 'Precious Materials',
    examples: ['gold', 'silver', 'platinum', 'diamond', 'pearl'],
    difficulty: 'medium'
  },
  {
    name: 'Building Materials',
    examples: ['brick', 'concrete', 'steel', 'timber', 'marble'],
    difficulty: 'medium'
  },
  {
    name: 'Architecture Styles',
    examples: ['gothic', 'modern', 'baroque', 'victorian', 'colonial'],
    difficulty: 'hard'
  },
  {
    name: 'Building Types',
    examples: ['house', 'apartment', 'castle', 'skyscraper', 'temple'],
    difficulty: 'medium'
  },
  {
    name: 'Room Types',
    examples: ['bedroom', 'kitchen', 'bathroom', 'garage', 'attic'],
    difficulty: 'easy'
  },
  {
    name: 'Garden Features',
    examples: ['fountain', 'pond', 'gazebo', 'path', 'fence'],
    difficulty: 'medium'
  },
  {
    name: 'Plants',
    examples: ['tree', 'flower', 'grass', 'bush', 'vine'],
    difficulty: 'easy'
  },
  {
    name: 'Trees',
    examples: ['oak', 'pine', 'maple', 'palm', 'willow'],
    difficulty: 'medium'
  },
  {
    name: 'Flowers',
    examples: ['rose', 'tulip', 'daisy', 'lily', 'sunflower'],
    difficulty: 'easy'
  },
  {
    name: 'Herbs',
    examples: ['basil', 'mint', 'oregano', 'thyme', 'rosemary'],
    difficulty: 'medium'
  },
  {
    name: 'Spices',
    examples: ['pepper', 'cinnamon', 'ginger', 'nutmeg', 'turmeric'],
    difficulty: 'medium'
  },
  {
    name: 'Condiments',
    examples: ['ketchup', 'mustard', 'mayonnaise', 'sauce', 'dressing'],
    difficulty: 'easy'
  },
  {
    name: 'Cooking Methods',
    examples: ['baking', 'frying', 'grilling', 'boiling', 'steaming'],
    difficulty: 'medium'
  },
  {
    name: 'Kitchen Appliances',
    examples: ['refrigerator', 'microwave', 'oven', 'blender', 'toaster'],
    difficulty: 'easy'
  },
  {
    name: 'Tableware',
    examples: ['plate', 'bowl', 'cup', 'fork', 'spoon'],
    difficulty: 'easy'
  },
  {
    name: 'Cleaning Supplies',
    examples: ['soap', 'sponge', 'mop', 'vacuum', 'broom'],
    difficulty: 'easy'
  },
  {
    name: 'Bathroom Items',
    examples: ['toothbrush', 'towel', 'shampoo', 'toilet', 'sink'],
    difficulty: 'easy'
  },
  {
    name: 'Personal Care',
    examples: ['deodorant', 'perfume', 'lotion', 'makeup', 'razor'],
    difficulty: 'medium'
  },
  {
    name: 'Fashion Accessories',
    examples: ['necklace', 'bracelet', 'ring', 'earrings', 'watch'],
    difficulty: 'medium'
  },
  {
    name: 'Bags',
    examples: ['backpack', 'purse', 'suitcase', 'wallet', 'briefcase'],
    difficulty: 'easy'
  },
  {
    name: 'Footwear',
    examples: ['sneakers', 'boots', 'sandals', 'slippers', 'heels'],
    difficulty: 'easy'
  },
  {
    name: 'Clothing Styles',
    examples: ['casual', 'formal', 'sporty', 'vintage', 'bohemian'],
    difficulty: 'medium'
  },
  {
    name: 'Fashion Brands',
    examples: ['nike', 'adidas', 'gucci', 'prada', 'zara'],
    difficulty: 'medium'
  },
  {
    name: 'Car Brands',
    examples: ['toyota', 'bmw', 'ford', 'honda', 'tesla'],
    difficulty: 'medium'
  },
  {
    name: 'Transportation Modes',
    examples: ['car', 'bus', 'train', 'plane', 'bike'],
    difficulty: 'easy'
  },
  {
    name: 'Road Features',
    examples: ['intersection', 'bridge', 'tunnel', 'highway', 'roundabout'],
    difficulty: 'medium'
  },
  {
    name: 'Traffic Signs',
    examples: ['stop', 'yield', 'speed limit', 'crosswalk', 'one way'],
    difficulty: 'medium'
  },
  {
    name: 'Vehicle Parts',
    examples: ['wheel', 'engine', 'brake', 'steering wheel', 'headlight'],
    difficulty: 'medium'
  },
  {
    name: 'Tools Advanced',
    examples: ['lathe', 'chisel', 'pliers', 'level', 'vise'],
    difficulty: 'hard'
  },
  {
    name: 'Construction Equipment',
    examples: ['crane', 'bulldozer', 'excavator', 'forklift', 'cement mixer'],
    difficulty: 'medium'
  },
  {
    name: 'Farm Equipment',
    examples: ['tractor', 'plow', 'harvester', 'sprinkler', 'thresher'],
    difficulty: 'medium'
  },
  {
    name: 'Farm Animals',
    examples: ['cow', 'pig', 'chicken', 'sheep', 'horse'],
    difficulty: 'easy'
  },
  {
    name: 'Wild Animals',
    examples: ['lion', 'tiger', 'bear', 'wolf', 'deer'],
    difficulty: 'easy'
  },
  {
    name: 'Pet Animals',
    examples: ['dog', 'cat', 'hamster', 'fish', 'parrot'],
    difficulty: 'easy'
  },
  {
    name: 'Animal Sounds',
    examples: ['bark', 'meow', 'roar', 'chirp', 'moo'],
    difficulty: 'easy'
  },
  {
    name: 'Animal Habitats',
    examples: ['jungle', 'desert', 'arctic', 'savanna', 'reef'],
    difficulty: 'medium'
  }
];

export interface GenerationContext {
  gameId: string;
  playerId: string;
  previouslyGeneratedWords: string[];
  playerCategory?: string;
  teamName?: string;
} 