@@ .. @@
 const ProfileScreen: React.FC<ProfileScreenProps> = ({
   onBack,
   userName,
   userHandle,
   phoneNumber,
   onSave
 }) => {
   const [name, setName] = useState(userName);
   const [handle, setHandle] = useState(userHandle);
   const [phone, setPhone] = useState(phoneNumber);
   const [loading, setSaving] = useState(false);

   const handleSave = async () => {
     if (!name.trim() || !handle.trim()) return;
     
     setSaving(true);
     
     // Simulate saving
     setTimeout(() => {
       onSave(name.trim(), handle.trim(), phone.trim());
       setSaving(false);
       onBack();
     }, 1000);
   };

   const hasChanges = name !== userName || handle !== userHandle || phone !== phoneNumber;

   return (
     <div className="h-full bg-white flex flex-col">
       {/* Header */}
       <div className="flex items-center justify-between p-4 border-b border-gray-100">
         <button 
           onClick={onBack}
           className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
         >
           <ArrowLeft className="w-5 h-5 text-gray-700" />
         </button>
         <h1 className="text-lg font-semibold text-black">Edit Profile</h1>
         <button
           onClick={handleSave}
           disabled={loading || !hasChanges}
           className="px-4 py-2 bg-black text-white rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
         >
           {loading ? 'Saving...' : 'Save'}
         </button>
       </div>

       <div className="flex-1 overflow-y-auto">
         {/* Profile Picture */}
         <div className="p-6 text-center border-b border-gray-100">
           <div className="relative inline-block">
             <div className="w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-400 rounded-full flex items-center justify-center">
               <span className="text-white text-2xl font-bold">
                 {name.charAt(0).toUpperCase()}
               </span>
             </div>
             <button className="absolute bottom-0 right-0 w-8 h-8 bg-black rounded-full flex items-center justify-center shadow-lg">
               <Camera className="w-4 h-4 text-white" />
             </button>
           </div>
           <p className="text-sm text-gray-600 mt-3">Tap to change photo</p>
         </div>

         {/* Form Fields */}
         <div className="p-6 space-y-6">
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               <User className="w-4 h-4 inline mr-2" />
               Full Name
             </label>
             <input
               type="text"
               value={name}
               onChange={(e) => setName(e.target.value)}
               placeholder="Enter your full name"
               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
               maxLength={50}
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               <AtSign className="w-4 h-4 inline mr-2" />
               Username
             </label>
             <input
               type="text"
               value={handle}
               onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
               placeholder="Enter your username"
               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
               maxLength={30}
             />
             <p className="text-xs text-gray-500 mt-1">
               Only lowercase letters, numbers, and underscores allowed
             </p>
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               <Phone className="w-4 h-4 inline mr-2" />
               Phone Number
             </label>
             <input
               type="tel"
               value={phone}
               onChange={(e) => setPhone(e.target.value)}
               placeholder="Enter your phone number"
               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
             />
           </div>
         </div>

         {/* Additional Info */}
         <div className="p-6 bg-gray-50 mx-6 rounded-xl">
           <h3 className="font-medium text-black mb-2">Profile Information</h3>
           <p className="text-sm text-gray-600 leading-relaxed">
             Your profile information helps other users discover and connect with your healing music. 
             Your phone number is kept private and used only for account security.
           </p>
         </div>
       </div>
     </div>
   );
 };

-export default ProfileScreen;
+export default ProfileScreen as React.FC<ProfileScreenProps>;