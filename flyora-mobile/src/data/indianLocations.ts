export interface IndianLocation {
  name: string; // Display name
  city: string;
  state: string;
  district?: string;
  code?: string; // IATA code if airport
  type: 'city' | 'town' | 'area' | 'airport' | 'district';
  aliases?: string[];
}

export const ALL_INDIA_LOCATIONS: IndianLocation[] = [
  // GUJARAT - ALL CITIES, TOWNS & DISTRICTS
  { name: 'Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', code: 'AMD', type: 'airport', aliases: ['Amdavad', 'SVPIA'] },
  { name: 'Surat', city: 'Surat', state: 'Gujarat', code: 'STV', type: 'airport', aliases: ['Diamond City'] },
  { name: 'Vadodara', city: 'Vadodara', state: 'Gujarat', code: 'BDQ', type: 'airport', aliases: ['Baroda'] },
  { name: 'Rajkot', city: 'Rajkot', state: 'Gujarat', code: 'HSR', type: 'airport', aliases: ['Hirasar'] },
  { name: 'Bhavnagar', city: 'Bhavnagar', state: 'Gujarat', code: 'BHU', type: 'airport' },
  { name: 'Jamnagar', city: 'Jamnagar', state: 'Gujarat', code: 'JGA', type: 'airport' },
  { name: 'Junagadh', city: 'Junagadh', state: 'Gujarat', type: 'city', aliases: ['Girnar'] },
  { name: 'Gandhinagar', city: 'Gandhinagar', state: 'Gujarat', type: 'city', aliases: ['GIFT City', 'Capital'] },
  { name: 'Anand', city: 'Anand', state: 'Gujarat', type: 'city', aliases: ['Amul', 'Milk City'] },
  { name: 'Nadiad', city: 'Nadiad', state: 'Gujarat', type: 'city', district: 'Kheda' },
  { name: 'Morbi', city: 'Morbi', state: 'Gujarat', type: 'city', aliases: ['Ceramic City'] },
  { name: 'Mehsana', city: 'Mehsana', state: 'Gujarat', type: 'city' },
  { name: 'Surendranagar', city: 'Surendranagar', state: 'Gujarat', type: 'city', aliases: ['Wadhwan'] },
  { name: 'Bharuch', city: 'Bharuch', state: 'Gujarat', type: 'city' },
  { name: 'Ankleshwar', city: 'Ankleshwar', state: 'Gujarat', type: 'city', district: 'Bharuch' },
  { name: 'Navsari', city: 'Navsari', state: 'Gujarat', type: 'city' },
  { name: 'Vapi', city: 'Vapi', state: 'Gujarat', type: 'city', district: 'Valsad' },
  { name: 'Valsad', city: 'Valsad', state: 'Gujarat', type: 'city' },
  { name: 'Porbandar', city: 'Porbandar', state: 'Gujarat', code: 'PBD', type: 'airport' },
  { name: 'Bhuj', city: 'Bhuj', state: 'Gujarat', code: 'BHJ', type: 'airport', aliases: ['Kutch'] },
  { name: 'Gandhidham', city: 'Gandhidham', state: 'Gujarat', code: 'IXY', type: 'airport', aliases: ['Kandla'] },
  { name: 'Veraval', city: 'Veraval', state: 'Gujarat', type: 'city', aliases: ['Somnath', 'Gir Somnath'] },
  { name: 'Godhra', city: 'Godhra', state: 'Gujarat', type: 'city', district: 'Panchmahal' },
  { name: 'Patan', city: 'Patan', state: 'Gujarat', type: 'city' },
  { name: 'Palanpur', city: 'Palanpur', state: 'Gujarat', type: 'city', district: 'Banaskantha' },
  { name: 'Dahod', city: 'Dahod', state: 'Gujarat', type: 'city' },
  { name: 'Botad', city: 'Botad', state: 'Gujarat', type: 'city', aliases: ['Salangpur'] },
  { name: 'Amreli', city: 'Amreli', state: 'Gujarat', type: 'city' },
  { name: 'Himatnagar', city: 'Himatnagar', state: 'Gujarat', type: 'city', district: 'Sabarkantha' },
  { name: 'Modasa', city: 'Modasa', state: 'Gujarat', type: 'city', district: 'Aravalli' },
  { name: 'Keshod', city: 'Keshod', state: 'Gujarat', code: 'IXK', type: 'airport' },
  { name: 'Gondal', city: 'Gondal', state: 'Gujarat', type: 'town', district: 'Rajkot' },
  { name: 'Jetpur', city: 'Jetpur', state: 'Gujarat', type: 'town', district: 'Rajkot' },
  { name: 'Kalol', city: 'Kalol', state: 'Gujarat', type: 'town', district: 'Gandhinagar' },
  { name: 'Deesa', city: 'Deesa', state: 'Gujarat', type: 'town', district: 'Banaskantha' },
  { name: 'Vyara', city: 'Vyara', state: 'Gujarat', type: 'town', district: 'Tapi' },
  { name: 'Bardoli', city: 'Bardoli', state: 'Gujarat', type: 'town', district: 'Surat' },
  { name: 'Sanand', city: 'Sanand', state: 'Gujarat', type: 'town', district: 'Ahmedabad' },
  { name: 'Dholera', city: 'Dholera', state: 'Gujarat', type: 'area', aliases: ['SIR'] },
  { name: 'Dwarka', city: 'Dwarka', state: 'Gujarat', type: 'city', district: 'Devbhoomi Dwarka' },
  { name: 'Halol', city: 'Halol', state: 'Gujarat', type: 'town', aliases: ['Pavagadh'] },
  { name: 'Unjha', city: 'Unjha', state: 'Gujarat', type: 'town', district: 'Mehsana' },
  { name: 'Visnagar', city: 'Visnagar', state: 'Gujarat', type: 'town', district: 'Mehsana' },
  { name: 'Kadi', city: 'Kadi', state: 'Gujarat', type: 'town', district: 'Mehsana' },
  { name: 'Mandvi', city: 'Mandvi', state: 'Gujarat', type: 'town', district: 'Kutch' },
  { name: 'Mahuva', city: 'Mahuva', state: 'Gujarat', type: 'town', district: 'Bhavnagar' },
  { name: 'Dhoraji', city: 'Dhoraji', state: 'Gujarat', type: 'town', district: 'Rajkot' },
  { name: 'Una', city: 'Una', state: 'Gujarat', type: 'town', district: 'Gir Somnath' },

  // MAHARASHTRA
  { name: 'Mumbai', city: 'Mumbai', state: 'Maharashtra', code: 'BOM', type: 'airport', aliases: ['Bombay', 'CSMIA'] },
  { name: 'Pune', city: 'Pune', state: 'Maharashtra', code: 'PNQ', type: 'airport', aliases: ['Poona'] },
  { name: 'Nagpur', city: 'Nagpur', state: 'Maharashtra', code: 'NAG', type: 'airport' },
  { name: 'Thane', city: 'Thane', state: 'Maharashtra', type: 'city' },
  { name: 'Nashik', city: 'Nashik', state: 'Maharashtra', code: 'ISK', type: 'airport', aliases: ['Nasik', 'Ozar'] },
  { name: 'Navi Mumbai', city: 'Navi Mumbai', state: 'Maharashtra', code: 'NMI', type: 'airport' },
  { name: 'Chhatrapati Sambhaji Nagar', city: 'Aurangabad', state: 'Maharashtra', code: 'IXU', type: 'airport', aliases: ['Aurangabad'] },
  { name: 'Solapur', city: 'Solapur', state: 'Maharashtra', type: 'city', aliases: ['Sholapur'] },
  { name: 'Kolhapur', city: 'Kolhapur', state: 'Maharashtra', code: 'KLH', type: 'airport' },
  { name: 'Amravati', city: 'Amravati', state: 'Maharashtra', type: 'city' },
  { name: 'Nanded', city: 'Nanded', state: 'Maharashtra', code: 'NDC', type: 'airport' },
  { name: 'Sangli', city: 'Sangli', state: 'Maharashtra', type: 'city', aliases: ['Miraj'] },
  { name: 'Jalgaon', city: 'Jalgaon', state: 'Maharashtra', type: 'city' },
  { name: 'Akola', city: 'Akola', state: 'Maharashtra', type: 'city' },
  { name: 'Latur', city: 'Latur', state: 'Maharashtra', type: 'city' },
  { name: 'Dhule', city: 'Dhule', state: 'Maharashtra', type: 'city' },
  { name: 'Ahmednagar', city: 'Ahmednagar', state: 'Maharashtra', type: 'city', aliases: ['Ahilyanagar'] },
  { name: 'Chandrapur', city: 'Chandrapur', state: 'Maharashtra', type: 'city' },
  { name: 'Parbhani', city: 'Parbhani', state: 'Maharashtra', type: 'city' },
  { name: 'Jalna', city: 'Jalna', state: 'Maharashtra', type: 'city' },
  { name: 'Shirdi', city: 'Shirdi', state: 'Maharashtra', code: 'SAG', type: 'airport' },
  { name: 'Kalyan', city: 'Kalyan', state: 'Maharashtra', type: 'city', aliases: ['Dombivli'] },
  { name: 'Vasai-Virar', city: 'Vasai-Virar', state: 'Maharashtra', type: 'city', aliases: ['Palghar'] },
  { name: 'Bhiwandi', city: 'Bhiwandi', state: 'Maharashtra', type: 'city' },
  { name: 'Panvel', city: 'Panvel', state: 'Maharashtra', type: 'city', district: 'Raigad' },
  { name: 'Satara', city: 'Satara', state: 'Maharashtra', type: 'city' },
  { name: 'Beed', city: 'Beed', state: 'Maharashtra', type: 'city' },
  { name: 'Ratnagiri', city: 'Ratnagiri', state: 'Maharashtra', type: 'city', aliases: ['Konkan'] },
  { name: 'Sindhudurg', city: 'Sindhudurg', state: 'Maharashtra', code: 'SDW', type: 'airport', aliases: ['Chipi'] },
  { name: 'Wardha', city: 'Wardha', state: 'Maharashtra', type: 'city' },
  { name: 'Gondia', city: 'Gondia', state: 'Maharashtra', type: 'city' },
  { name: 'Yavatmal', city: 'Yavatmal', state: 'Maharashtra', type: 'city' },
  { name: 'Baramati', city: 'Baramati', state: 'Maharashtra', type: 'town', district: 'Pune' },
  { name: 'Ichalkaranji', city: 'Ichalkaranji', state: 'Maharashtra', type: 'city', district: 'Kolhapur' },

  // DELHI NCR & NORTH
  { name: 'New Delhi', city: 'New Delhi', state: 'Delhi NCR', code: 'DEL', type: 'airport', aliases: ['Delhi', 'IGIA', 'Palam'] },
  { name: 'Noida', city: 'Noida', state: 'Uttar Pradesh', code: 'DXN', type: 'airport', aliases: ['Jewar', 'Greater Noida'] },
  { name: 'Gurugram', city: 'Gurugram', state: 'Haryana', type: 'city', aliases: ['Gurgaon', 'Cyber City'] },
  { name: 'Faridabad', city: 'Faridabad', state: 'Haryana', type: 'city' },
  { name: 'Ghaziabad', city: 'Ghaziabad', state: 'Uttar Pradesh', code: 'HDO', type: 'airport', aliases: ['Hindon'] },
  { name: 'Chandigarh', city: 'Chandigarh', state: 'Punjab / Haryana', code: 'IXC', type: 'airport', aliases: ['Mohali', 'Panchkula'] },

  // KARNATAKA
  { name: 'Bengaluru', city: 'Bengaluru', state: 'Karnataka', code: 'BLR', type: 'airport', aliases: ['Bangalore', 'KIA'] },
  { name: 'Mysuru', city: 'Mysuru', state: 'Karnataka', code: 'MYQ', type: 'airport', aliases: ['Mysore'] },
  { name: 'Hubballi-Dharwad', city: 'Hubli', state: 'Karnataka', code: 'HBX', type: 'airport', aliases: ['Hubli', 'Dharwad'] },
  { name: 'Mangaluru', city: 'Mangalore', state: 'Karnataka', code: 'IXE', type: 'airport', aliases: ['Mangalore'] },
  { name: 'Belagavi', city: 'Belgaum', state: 'Karnataka', code: 'IXG', type: 'airport', aliases: ['Belgaum'] },
  { name: 'Kalaburagi', city: 'Kalaburagi', state: 'Karnataka', code: 'GBI', type: 'airport', aliases: ['Gulbarga'] },
  { name: 'Shivamogga', city: 'Shivamogga', state: 'Karnataka', code: 'RQY', type: 'airport', aliases: ['Shimoga'] },
  { name: 'Ballari', city: 'Ballari', state: 'Karnataka', type: 'city', aliases: ['Bellary', 'Hampi'] },
  { name: 'Davanagere', city: 'Davanagere', state: 'Karnataka', type: 'city' },
  { name: 'Tumakuru', city: 'Tumakuru', state: 'Karnataka', type: 'city', aliases: ['Tumkur'] },
  { name: 'Vijayapura', city: 'Vijayapura', state: 'Karnataka', type: 'city', aliases: ['Bijapur'] },
  { name: 'Bidar', city: 'Bidar', state: 'Karnataka', code: 'IXX', type: 'airport' },
  { name: 'Hassan', city: 'Hassan', state: 'Karnataka', type: 'city' },
  { name: 'Udupi', city: 'Udupi', state: 'Karnataka', type: 'city', aliases: ['Manipal'] },
  { name: 'Chikkamagaluru', city: 'Chikkamagaluru', state: 'Karnataka', type: 'city', aliases: ['Chikmagalur'] },

  // TELANGANA & ANDHRA PRADESH
  { name: 'Hyderabad', city: 'Hyderabad', state: 'Telangana', code: 'HYD', type: 'airport', aliases: ['Secunderabad', 'RGIA'] },
  { name: 'Warangal', city: 'Warangal', state: 'Telangana', type: 'city', aliases: ['Hanamkonda'] },
  { name: 'Nizamabad', city: 'Nizamabad', state: 'Telangana', type: 'city' },
  { name: 'Karimnagar', city: 'Karimnagar', state: 'Telangana', type: 'city' },
  { name: 'Khammam', city: 'Khammam', state: 'Telangana', type: 'city' },
  { name: 'Ramagundam', city: 'Ramagundam', state: 'Telangana', type: 'city' },
  { name: 'Visakhapatnam', city: 'Visakhapatnam', state: 'Andhra Pradesh', code: 'VTZ', type: 'airport', aliases: ['Vizag'] },
  { name: 'Vijayawada', city: 'Vijayawada', state: 'Andhra Pradesh', code: 'VGA', type: 'airport', aliases: ['Amaravati'] },
  { name: 'Tirupati', city: 'Tirupati', state: 'Andhra Pradesh', code: 'TIR', type: 'airport' },
  { name: 'Rajahmundry', city: 'Rajahmundry', state: 'Andhra Pradesh', code: 'RJA', type: 'airport' },
  { name: 'Guntur', city: 'Guntur', state: 'Andhra Pradesh', type: 'city' },
  { name: 'Nellore', city: 'Nellore', state: 'Andhra Pradesh', type: 'city' },
  { name: 'Kurnool', city: 'Kurnool', state: 'Andhra Pradesh', code: 'KJB', type: 'airport' },
  { name: 'Kadapa', city: 'Kadapa', state: 'Andhra Pradesh', code: 'CDP', type: 'airport', aliases: ['Cuddapah'] },
  { name: 'Kakinada', city: 'Kakinada', state: 'Andhra Pradesh', type: 'city' },
  { name: 'Anantapur', city: 'Anantapur', state: 'Andhra Pradesh', type: 'city' },

  // TAMIL NADU
  { name: 'Chennai', city: 'Chennai', state: 'Tamil Nadu', code: 'MAA', type: 'airport', aliases: ['Madras'] },
  { name: 'Coimbatore', city: 'Coimbatore', state: 'Tamil Nadu', code: 'CJB', type: 'airport', aliases: ['Kovai'] },
  { name: 'Madurai', city: 'Madurai', state: 'Tamil Nadu', code: 'IXM', type: 'airport' },
  { name: 'Tiruchirappalli', city: 'Tiruchirappalli', state: 'Tamil Nadu', code: 'TRZ', type: 'airport', aliases: ['Trichy'] },
  { name: 'Salem', city: 'Salem', state: 'Tamil Nadu', code: 'SXV', type: 'airport' },
  { name: 'Tirunelveli', city: 'Tirunelveli', state: 'Tamil Nadu', type: 'city' },
  { name: 'Tiruppur', city: 'Tiruppur', state: 'Tamil Nadu', type: 'city' },
  { name: 'Vellore', city: 'Vellore', state: 'Tamil Nadu', type: 'city' },
  { name: 'Erode', city: 'Erode', state: 'Tamil Nadu', type: 'city' },
  { name: 'Thoothukudi', city: 'Thoothukudi', state: 'Tamil Nadu', code: 'TCR', type: 'airport', aliases: ['Tuticorin'] },
  { name: 'Thanjavur', city: 'Thanjavur', state: 'Tamil Nadu', type: 'city', aliases: ['Tanjore'] },
  { name: 'Hosur', city: 'Hosur', state: 'Tamil Nadu', type: 'city' },
  { name: 'Nagercoil', city: 'Nagercoil', state: 'Tamil Nadu', type: 'city', aliases: ['Kanyakumari'] },
  { name: 'Kanchipuram', city: 'Kanchipuram', state: 'Tamil Nadu', type: 'city' },
  { name: 'Ooty', city: 'Ooty', state: 'Tamil Nadu', type: 'city', aliases: ['Udhagamandalam', 'Nilgiris'] },

  // KERALA
  { name: 'Kochi', city: 'Kochi', state: 'Kerala', code: 'COK', type: 'airport', aliases: ['Cochin', 'Ernakulam'] },
  { name: 'Thiruvananthapuram', city: 'Thiruvananthapuram', state: 'Kerala', code: 'TRV', type: 'airport', aliases: ['Trivandrum'] },
  { name: 'Kozhikode', city: 'Kozhikode', state: 'Kerala', code: 'CCJ', type: 'airport', aliases: ['Calicut'] },
  { name: 'Kannur', city: 'Kannur', state: 'Kerala', code: 'CNN', type: 'airport' },
  { name: 'Kollam', city: 'Kollam', state: 'Kerala', type: 'city', aliases: ['Quilon'] },
  { name: 'Thrissur', city: 'Thrissur', state: 'Kerala', type: 'city', aliases: ['Trichur'] },
  { name: 'Alappuzha', city: 'Alappuzha', state: 'Kerala', type: 'city', aliases: ['Alleppey'] },
  { name: 'Palakkad', city: 'Palakkad', state: 'Kerala', type: 'city', aliases: ['Palghat'] },
  { name: 'Kottayam', city: 'Kottayam', state: 'Kerala', type: 'city' },
  { name: 'Malappuram', city: 'Malappuram', state: 'Kerala', type: 'city' },
  { name: 'Kasaragod', city: 'Kasaragod', state: 'Kerala', type: 'city' },
  { name: 'Munnar', city: 'Munnar', state: 'Kerala', type: 'town', district: 'Idukki' },
  { name: 'Wayanad', city: 'Wayanad', state: 'Kerala', type: 'district', aliases: ['Kalpetta'] },

  // RAJASTHAN
  { name: 'Jaipur', city: 'Jaipur', state: 'Rajasthan', code: 'JAI', type: 'airport', aliases: ['Pink City'] },
  { name: 'Udaipur', city: 'Udaipur', state: 'Rajasthan', code: 'UDR', type: 'airport', aliases: ['City of Lakes'] },
  { name: 'Jodhpur', city: 'Jodhpur', state: 'Rajasthan', code: 'JDH', type: 'airport', aliases: ['Blue City'] },
  { name: 'Kota', city: 'Kota', state: 'Rajasthan', type: 'city' },
  { name: 'Bikaner', city: 'Bikaner', state: 'Rajasthan', code: 'BKB', type: 'airport' },
  { name: 'Ajmer', city: 'Ajmer', state: 'Rajasthan', code: 'KQH', type: 'airport', aliases: ['Kishangarh', 'Pushkar'] },
  { name: 'Bhilwara', city: 'Bhilwara', state: 'Rajasthan', type: 'city' },
  { name: 'Alwar', city: 'Alwar', state: 'Rajasthan', type: 'city' },
  { name: 'Sikar', city: 'Sikar', state: 'Rajasthan', type: 'city', aliases: ['Khatu Shyam'] },
  { name: 'Sri Ganganagar', city: 'Sri Ganganagar', state: 'Rajasthan', type: 'city' },
  { name: 'Bharatpur', city: 'Bharatpur', state: 'Rajasthan', type: 'city' },
  { name: 'Pali', city: 'Pali', state: 'Rajasthan', type: 'city' },
  { name: 'Jaisalmer', city: 'Jaisalmer', state: 'Rajasthan', code: 'JSA', type: 'airport', aliases: ['Golden City'] },
  { name: 'Chittorgarh', city: 'Chittorgarh', state: 'Rajasthan', type: 'city' },

  // UTTAR PRADESH
  { name: 'Lucknow', city: 'Lucknow', state: 'Uttar Pradesh', code: 'LKO', type: 'airport', aliases: ['Amausi'] },
  { name: 'Kanpur', city: 'Kanpur', state: 'Uttar Pradesh', code: 'KNU', type: 'airport' },
  { name: 'Varanasi', city: 'Varanasi', state: 'Uttar Pradesh', code: 'VNS', type: 'airport', aliases: ['Banaras', 'Kashi'] },
  { name: 'Agra', city: 'Agra', state: 'Uttar Pradesh', code: 'AGR', type: 'airport', aliases: ['Taj Mahal'] },
  { name: 'Prayagraj', city: 'Prayagraj', state: 'Uttar Pradesh', code: 'IXD', type: 'airport', aliases: ['Allahabad'] },
  { name: 'Ayodhya', city: 'Ayodhya', state: 'Uttar Pradesh', code: 'AYJ', type: 'airport', aliases: ['Ram Mandir', 'Faizabad'] },
  { name: 'Meerut', city: 'Meerut', state: 'Uttar Pradesh', type: 'city' },
  { name: 'Bareilly', city: 'Bareilly', state: 'Uttar Pradesh', code: 'BEK', type: 'airport' },
  { name: 'Aligarh', city: 'Aligarh', state: 'Uttar Pradesh', type: 'city' },
  { name: 'Moradabad', city: 'Moradabad', state: 'Uttar Pradesh', type: 'city' },
  { name: 'Saharanpur', city: 'Saharanpur', state: 'Uttar Pradesh', type: 'city' },
  { name: 'Gorakhpur', city: 'Gorakhpur', state: 'Uttar Pradesh', code: 'GOP', type: 'airport' },
  { name: 'Firozabad', city: 'Firozabad', state: 'Uttar Pradesh', type: 'city' },
  { name: 'Jhansi', city: 'Jhansi', state: 'Uttar Pradesh', type: 'city' },
  { name: 'Muzaffarnagar', city: 'Muzaffarnagar', state: 'Uttar Pradesh', type: 'city' },
  { name: 'Mathura', city: 'Mathura', state: 'Uttar Pradesh', type: 'city', aliases: ['Vrindavan'] },
  { name: 'Budaun', city: 'Budaun', state: 'Uttar Pradesh', type: 'city' },
  { name: 'Rampur', city: 'Rampur', state: 'Uttar Pradesh', type: 'city' },
  { name: 'Shahjahanpur', city: 'Shahjahanpur', state: 'Uttar Pradesh', type: 'city' },
  { name: 'Farrukhabad', city: 'Farrukhabad', state: 'Uttar Pradesh', type: 'city' },
  { name: 'Hapur', city: 'Hapur', state: 'Uttar Pradesh', type: 'city' },
  { name: 'Etawah', city: 'Etawah', state: 'Uttar Pradesh', type: 'city' },
  { name: 'Mirzapur', city: 'Mirzapur', state: 'Uttar Pradesh', type: 'city' },

  // MADHYA PRADESH & CHHATTISGARH
  { name: 'Indore', city: 'Indore', state: 'Madhya Pradesh', code: 'IDR', type: 'airport' },
  { name: 'Bhopal', city: 'Bhopal', state: 'Madhya Pradesh', code: 'BHO', type: 'airport' },
  { name: 'Jabalpur', city: 'Jabalpur', state: 'Madhya Pradesh', code: 'JLR', type: 'airport' },
  { name: 'Gwalior', city: 'Gwalior', state: 'Madhya Pradesh', code: 'GWL', type: 'airport' },
  { name: 'Ujjain', city: 'Ujjain', state: 'Madhya Pradesh', type: 'city', aliases: ['Mahakaleshwar'] },
  { name: 'Sagar', city: 'Sagar', state: 'Madhya Pradesh', type: 'city' },
  { name: 'Dewas', city: 'Dewas', state: 'Madhya Pradesh', type: 'city' },
  { name: 'Satna', city: 'Satna', state: 'Madhya Pradesh', type: 'city' },
  { name: 'Ratlam', city: 'Ratlam', state: 'Madhya Pradesh', type: 'city' },
  { name: 'Rewa', city: 'Rewa', state: 'Madhya Pradesh', type: 'city' },
  { name: 'Katni', city: 'Katni', state: 'Madhya Pradesh', type: 'city' },
  { name: 'Singrauli', city: 'Singrauli', state: 'Madhya Pradesh', type: 'city' },
  { name: 'Burhanpur', city: 'Burhanpur', state: 'Madhya Pradesh', type: 'city' },
  { name: 'Khandwa', city: 'Khandwa', state: 'Madhya Pradesh', type: 'city', aliases: ['Omkareshwar'] },
  { name: 'Khajuraho', city: 'Khajuraho', state: 'Madhya Pradesh', code: 'HJR', type: 'airport' },
  { name: 'Raipur', city: 'Raipur', state: 'Chhattisgarh', code: 'RPR', type: 'airport', aliases: ['Naya Raipur'] },
  { name: 'Bhilai', city: 'Bhilai', state: 'Chhattisgarh', type: 'city', district: 'Durg' },
  { name: 'Bilaspur', city: 'Bilaspur', state: 'Chhattisgarh', code: 'PAB', type: 'airport' },
  { name: 'Korba', city: 'Korba', state: 'Chhattisgarh', type: 'city' },
  { name: 'Jagdalpur', city: 'Jagdalpur', state: 'Chhattisgarh', code: 'JGB', type: 'airport' },

  // WEST BENGAL, BIHAR, JHARKHAND, ODISHA
  { name: 'Kolkata', city: 'Kolkata', state: 'West Bengal', code: 'CCU', type: 'airport', aliases: ['Calcutta', 'Howrah'] },
  { name: 'Siliguri', city: 'Siliguri', state: 'West Bengal', code: 'IXB', type: 'airport', aliases: ['Bagdogra', 'Darjeeling'] },
  { name: 'Asansol', city: 'Asansol', state: 'West Bengal', type: 'city' },
  { name: 'Durgapur', city: 'Durgapur', state: 'West Bengal', code: 'RDP', type: 'airport' },
  { name: 'Bardhaman', city: 'Bardhaman', state: 'West Bengal', type: 'city', aliases: ['Burdwan'] },
  { name: 'Malda', city: 'Malda', state: 'West Bengal', type: 'city' },
  { name: 'Kharagpur', city: 'Kharagpur', state: 'West Bengal', type: 'city', district: 'Paschim Medinipur' },
  { name: 'Patna', city: 'Patna', state: 'Bihar', code: 'PAT', type: 'airport' },
  { name: 'Gaya', city: 'Gaya', state: 'Bihar', code: 'GAY', type: 'airport', aliases: ['Bodh Gaya'] },
  { name: 'Darbhanga', city: 'Darbhanga', state: 'Bihar', code: 'DBR', type: 'airport' },
  { name: 'Bhagalpur', city: 'Bhagalpur', state: 'Bihar', type: 'city' },
  { name: 'Muzaffarpur', city: 'Muzaffarpur', state: 'Bihar', type: 'city' },
  { name: 'Purnia', city: 'Purnia', state: 'Bihar', type: 'city' },
  { name: 'Bihar Sharif', city: 'Bihar Sharif', state: 'Bihar', type: 'city', district: 'Nalanda' },
  { name: 'Arrah', city: 'Arrah', state: 'Bihar', type: 'city', district: 'Bhojpur' },
  { name: 'Begusarai', city: 'Begusarai', state: 'Bihar', type: 'city' },
  { name: 'Ranchi', city: 'Ranchi', state: 'Jharkhand', code: 'IXR', type: 'airport' },
  { name: 'Jamshedpur', city: 'Jamshedpur', state: 'Jharkhand', type: 'city', aliases: ['Tatanagar'] },
  { name: 'Dhanbad', city: 'Dhanbad', state: 'Jharkhand', type: 'city' },
  { name: 'Bokaro Steel City', city: 'Bokaro', state: 'Jharkhand', type: 'city' },
  { name: 'Deoghar', city: 'Deoghar', state: 'Jharkhand', code: 'DGH', type: 'airport', aliases: ['Baidyanath Dham'] },
  { name: 'Hazaribagh', city: 'Hazaribagh', state: 'Jharkhand', type: 'city' },
  { name: 'Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha', code: 'BBI', type: 'airport' },
  { name: 'Cuttack', city: 'Cuttack', state: 'Odisha', type: 'city' },
  { name: 'Rourkela', city: 'Rourkela', state: 'Odisha', code: 'RRK', type: 'airport' },
  { name: 'Berhampur', city: 'Brahmapur', state: 'Odisha', type: 'city' },
  { name: 'Sambalpur', city: 'Sambalpur', state: 'Odisha', type: 'city' },
  { name: 'Puri', city: 'Puri', state: 'Odisha', type: 'city', aliases: ['Jagannath Puri'] },
  { name: 'Jharsuguda', city: 'Jharsuguda', state: 'Odisha', code: 'JRG', type: 'airport' },
  { name: 'Balasore', city: 'Balasore', state: 'Odisha', type: 'city' },

  // PUNJAB, HARYANA, HIMACHAL, UTTARAKHAND, J&K, GOA
  { name: 'Ludhiana', city: 'Ludhiana', state: 'Punjab', type: 'city' },
  { name: 'Amritsar', city: 'Amritsar', state: 'Punjab', code: 'ATQ', type: 'airport', aliases: ['Golden Temple'] },
  { name: 'Jalandhar', city: 'Jalandhar', state: 'Punjab', type: 'city', aliases: ['Adampur'] },
  { name: 'Patiala', city: 'Patiala', state: 'Punjab', type: 'city' },
  { name: 'Bathinda', city: 'Bathinda', state: 'Punjab', code: 'BUP', type: 'airport' },
  { name: 'Mohali', city: 'Mohali', state: 'Punjab', type: 'city', aliases: ['SAS Nagar'] },
  { name: 'Panipat', city: 'Panipat', state: 'Haryana', type: 'city' },
  { name: 'Ambala', city: 'Ambala', state: 'Haryana', type: 'city' },
  { name: 'Rohtak', city: 'Rohtak', state: 'Haryana', type: 'city' },
  { name: 'Hisar', city: 'Hisar', state: 'Haryana', code: 'HSS', type: 'airport' },
  { name: 'Karnal', city: 'Karnal', state: 'Haryana', type: 'city' },
  { name: 'Sonipat', city: 'Sonipat', state: 'Haryana', type: 'city' },
  { name: 'Shimla', city: 'Shimla', state: 'Himachal Pradesh', code: 'SLV', type: 'airport' },
  { name: 'Dharamshala', city: 'Dharamshala', state: 'Himachal Pradesh', code: 'DHM', type: 'airport', aliases: ['Kangra', 'McLeodganj'] },
  { name: 'Manali', city: 'Manali', state: 'Himachal Pradesh', code: 'KUU', type: 'airport', aliases: ['Kullu'] },
  { name: 'Solan', city: 'Solan', state: 'Himachal Pradesh', type: 'city' },
  { name: 'Mandi', city: 'Mandi', state: 'Himachal Pradesh', type: 'city' },
  { name: 'Dehradun', city: 'Dehradun', state: 'Uttarakhand', code: 'DED', type: 'airport', aliases: ['Rishikesh', 'Haridwar'] },
  { name: 'Haridwar', city: 'Haridwar', state: 'Uttarakhand', type: 'city' },
  { name: 'Rishikesh', city: 'Rishikesh', state: 'Uttarakhand', type: 'city' },
  { name: 'Haldwani', city: 'Haldwani', state: 'Uttarakhand', type: 'city', district: 'Nainital' },
  { name: 'Roorkee', city: 'Roorkee', state: 'Uttarakhand', type: 'city' },
  { name: 'Pantnagar', city: 'Pantnagar', state: 'Uttarakhand', code: 'PGH', type: 'airport' },
  { name: 'Srinagar', city: 'Srinagar', state: 'Jammu & Kashmir', code: 'SXR', type: 'airport' },
  { name: 'Jammu', city: 'Jammu', state: 'Jammu & Kashmir', code: 'IXJ', type: 'airport' },
  { name: 'Leh', city: 'Leh', state: 'Ladakh', code: 'IXL', type: 'airport', aliases: ['Ladakh'] },
  { name: 'Panaji', city: 'Panaji', state: 'Goa', code: 'GOI', type: 'airport', aliases: ['North Goa', 'Dabolim', 'Mopa', 'GOX'] },
  { name: 'Margao', city: 'Margao', state: 'Goa', type: 'city', aliases: ['Madgaon', 'South Goa'] },
  { name: 'Vasco da Gama', city: 'Vasco da Gama', state: 'Goa', type: 'city' },

  // NORTH EAST & ISLANDS
  { name: 'Guwahati', city: 'Guwahati', state: 'Assam', code: 'GAU', type: 'airport', aliases: ['Dispur'] },
  { name: 'Silchar', city: 'Silchar', state: 'Assam', code: 'IXS', type: 'airport' },
  { name: 'Dibrugarh', city: 'Dibrugarh', state: 'Assam', code: 'DIB', type: 'airport' },
  { name: 'Jorhat', city: 'Jorhat', state: 'Assam', code: 'JRH', type: 'airport' },
  { name: 'Nagaon', city: 'Nagaon', state: 'Assam', type: 'city' },
  { name: 'Tezpur', city: 'Tezpur', state: 'Assam', code: 'TEZ', type: 'airport' },
  { name: 'Agartala', city: 'Agartala', state: 'Tripura', code: 'IXA', type: 'airport' },
  { name: 'Imphal', city: 'Imphal', state: 'Manipur', code: 'IMF', type: 'airport' },
  { name: 'Shillong', city: 'Shillong', state: 'Meghalaya', code: 'SHL', type: 'airport' },
  { name: 'Aizawl', city: 'Aizawl', state: 'Mizoram', code: 'AJL', type: 'airport' },
  { name: 'Dimapur', city: 'Dimapur', state: 'Nagaland', code: 'DMU', type: 'airport', aliases: ['Kohima'] },
  { name: 'Kohima', city: 'Kohima', state: 'Nagaland', type: 'city' },
  { name: 'Gangtok', city: 'Gangtok', state: 'Sikkim', code: 'PYG', type: 'airport', aliases: ['Pakyong'] },
  { name: 'Itanagar', city: 'Itanagar', state: 'Arunachal Pradesh', code: 'HGI', type: 'airport', aliases: ['Hollongi'] },
  { name: 'Port Blair', city: 'Port Blair', state: 'Andaman & Nicobar', code: 'IXZ', type: 'airport', aliases: ['Havelock'] },
  { name: 'Kavaratti', city: 'Kavaratti', state: 'Lakshadweep', code: 'AGX', type: 'airport', aliases: ['Agatti'] },
];

/**
 * Fast in-memory search across all Indian cities, towns, and districts.
 */
export function searchLocalIndianLocations(query: string, limit = 8): IndianLocation[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const exactCity: IndianLocation[] = [];
  const startsWithCity: IndianLocation[] = [];
  const containsCity: IndianLocation[] = [];
  const containsDistrictOrAlias: IndianLocation[] = [];

  for (const loc of ALL_INDIA_LOCATIONS) {
    const name = loc.name.toLowerCase();
    const city = loc.city.toLowerCase();
    const code = (loc.code || '').toLowerCase();
    const state = loc.state.toLowerCase();
    const district = (loc.district || '').toLowerCase();
    const aliases = (loc.aliases || []).map(a => a.toLowerCase());

    if (code === q || city === q || name === q) {
      exactCity.push(loc);
    } else if (code.startsWith(q) || city.startsWith(q) || name.startsWith(q)) {
      startsWithCity.push(loc);
    } else if (city.includes(q) || name.includes(q)) {
      containsCity.push(loc);
    } else if (district.includes(q) || state.includes(q) || aliases.some(a => a.includes(q))) {
      containsDistrictOrAlias.push(loc);
    }
  }

  const combined = [...exactCity, ...startsWithCity, ...containsCity, ...containsDistrictOrAlias];
  const seen = new Set<string>();
  const results: IndianLocation[] = [];

  for (const item of combined) {
    const key = `${item.name}-${item.state}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push(item);
      if (results.length >= limit) break;
    }
  }

  return results;
}

/**
 * Live Geocoder for any place in India (area, town, village, street, landmark)
 * Uses OpenStreetMap Nominatim / Photon free service bounded to India.
 */
export async function searchLiveIndianPlaces(query: string): Promise<IndianLocation[]> {
  const q = query.trim();
  if (!q || q.length < 2) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    // Photon Geocoder (Fast OSM API, strictly within India coordinates)
    // India Bounding Box: [68.1, 6.5, 97.4, 35.5]
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6&bbox=68.1,6.5,97.4,35.5`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const data = await res.json();
    if (!data || !Array.isArray(data.features)) return [];

    const liveResults: IndianLocation[] = [];
    for (const f of data.features) {
      const p = f.properties || {};
      if (p.countrycode && p.countrycode.toLowerCase() !== 'in') continue;

      const placeName = p.name || '';
      const state = p.state || '';
      const city = p.city || p.district || p.county || placeName;
      const type = p.osm_value === 'aerodrome' ? 'airport' :
                   (p.osm_value === 'city' || p.osm_value === 'town') ? 'city' : 'area';

      if (placeName) {
        liveResults.push({
          name: placeName,
          city: city || placeName,
          state: state || 'India',
          district: p.district || p.county,
          type
        });
      }
    }
    return liveResults;
  } catch (err) {
    // If live search fails or times out, gracefully return empty array so local dataset serves
    return [];
  }
}
