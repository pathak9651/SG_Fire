import Product from '../models/Product.js';

const AI_RESPONSES = {
  "Which fire extinguisher is recommended for a home kitchen?": 
    "### 🧯 Recommended Home Kitchen Extinguisher: Class F or CO2\n\n#### 1. Kitchen Extinguisher Types:\n* **Class F (Wet Chemical) Extinguisher:**\n  * **Best for Kitchens:** Specifically designed for cooking oil, fat, and deep fryer fires (Class F/K).\n  * **Mechanism:** It releases a soapy chemical foam that cools the oil and smothers the fire via a process called *saponification*.\n* **Carbon Dioxide (CO2) Gas Extinguisher:**\n  * **Safe for Electricals:** Recommended if an electrical appliance (microwave, toaster, stovetop) catches fire.\n  * **Mechanism:** Displaces oxygen. Leaves zero messy chemical residue, protecting electrical circuits.\n\n#### ⚠️ Critical Hazard Alert:\n> [!WARNING]\n> **NEVER USE WATER ON A GREASE OR ELECTRICAL FIRE!**\n> Water will vaporize instantly, exploding the burning grease into a massive fireball and spreading the fire across the room.",

  "Where should I install smoke detectors in my house?":
    "### 🚨 Residential Smoke Detector Placement Guide\n\nDetectors must be strategically positioned across your living areas according to international safety standards (NFPA 72).\n\n#### 1. Essential Locations (Where to Install):\n* **Inside Every Bedroom:** Ensures sleepers are woken up even if doors are closed.\n* **Outside Every Sleeping Area:** Install in common corridors leading to bedrooms.\n* **Every Floor Level:** Put at least one detector on every single level of the house, including basements.\n\n#### 2. Prohibited Locations (Where to Avoid):\n* **Within 10 feet of Cooking Appliances:** Cooking fumes trigger false alarms.\n* **Bathrooms or High-Humidity Areas:** Moisture can damage internal photoelectric sensors.\n\n#### 💡 Optimal Mounting Tips:\n> [!TIP]\n> Mount smoke detectors on ceilings, keeping them at least **4 inches (10 cm)** away from adjacent walls.",

  "What are the immediate steps to take if a grease fire starts?":
    "### 🔥 Immediate Action Plan: Grease Fire Emergency\n\nA grease fire is highly volatile and spreads rapidly. Follow this strict 4-step emergency sequence to control it safely:\n\n#### 1. Cut the Heat Source Immediately:\n* Turn the burner **OFF**. If safe, unplug electric deep fryers. Do not move the burning pan.\n\n#### 2. Smother the Flame:\n* Slide a large **metal pan lid** or baking sheet over the pan to cut off oxygen.\n* You can also dump a generous amount of **baking soda** onto the flame.\n\n#### 3. Do NOT Move the Pan:\n* Carrying a burning, oil-filled pan to the sink or outdoors will cause severe skin burns and splash fire across your kitchen.\n\n#### 4. Evacuate & Call Emergency Services:\n* If the fire is not completely smothered within 30 seconds, evacuate the building immediately and dial the emergency line (101 / 112).\n\n#### 🧯 Emergency Fire Checklist:\n| Safe Actions | Dangerous Actions |\n| :--- | :--- |\n| Turn burner OFF | Throw Water on the pan |\n| Cover with a metal lid | Wave kitchen towels to fan flames |\n| Pour Baking Soda | Try to carry the pan outside |\n| Use a Class F / CO2 extinguisher | Use flour or baking powder |",

  "How often should I test my residential fire safety equipment?":
    "### 🛠️ Residential Safety Equipment Maintenance Schedule\n\nContinuous testing guarantees your home defense works when it matters most. Follow this NFPA-compliant residential schedule:\n\n#### 1. Smoke and Heat Detectors:\n* **Test (Monthly):** Press the physical test button to verify the alarm horn works.\n* **Batteries (Every 6 Months):** Replace standard 9V batteries twice a year.\n* **Replacement (Every 10 Years):** Replace the entire detector unit after 10 years of use.\n\n#### 2. Portable Fire Extinguishers:\n* **Visual Inspection (Monthly):** Check that the pressure gauge needle is in the **GREEN** zone. Ensure the nozzle is clear and the safety pin is intact.\n* **Shaking (Every 6 Months):** Turn dry powder extinguishers upside down and shake them to prevent the powder from compacting.\n* **Hydrostatic Testing (Every 5-10 Years):** Professional pressure test of the metal cylinder shell."
};

/**
 * Controller to handle live AI safety assistance
 */
export const handleAiChat = async (req, res) => {
  try {
    const { message, history, pathname } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const queryLower = message.toLowerCase();

    // 1. DYNAMIC PRODUCT SEARCH (Phase 3)
    // Identify keywords inside the user query to recommend products
    const keywords = ['extinguisher', 'blanket', 'alarm', 'detector', 'mask', 'chemical', 'grease', 'sprinkler', 'harness', 'safety', 'co2', 'powder'];
    let recommendedProducts = [];

    const matchedKeywords = keywords.filter(keyword => queryLower.includes(keyword));

    if (matchedKeywords.length > 0) {
      // Find matching products in MongoDB
      const searchQuery = {
        $or: matchedKeywords.map(kw => ({
          $or: [
            { title: { $regex: kw, $options: 'i' } },
            { description: { $regex: kw, $options: 'i' } },
            { tags: { $in: [new RegExp(kw, 'i')] } }
          ]
        }))
      };

      const dbProducts = await Product.find(searchQuery)
        .limit(3)
        .select('title slug price discountPrice images ratings');

      recommendedProducts = dbProducts.map(p => ({
        _id: p._id,
        name: p.title,
        slug: p.slug,
        price: p.discountPrice || p.price,
        image: p.images?.[0]?.url || '',
        rating: p.ratings
      }));
    }

    // 2. LIVE GEMINI CHAT QUERY (Phase 2)
    let reply = '';
    if (geminiApiKey) {
      try {
        const systemInstruction = `You are a professional, helpful, and highly skilled fire safety co-pilot and product expert for SG Fire. Answer questions strictly conforming to NFPA (National Fire Protection Association) standards. Keep answers highly structured with headings, bullet points, checklists, and warning blocks if applicable. When talking about products like fire extinguishers or alarms, mention the key specifications and ratings. Remain extremely safe, refusing to give instructions on creating fire hazards. User's current URL context is: ${pathname || '/'}.`;

        const contents = [];

        // Map past messages to Gemini standard structure
        if (history && history.length > 0) {
          history.forEach(item => {
            contents.push({
              role: item.role === 'user' ? 'user' : 'model',
              parts: [{ text: item.text }]
            });
          });
        }

        // Add latest query
        contents.push({
          role: 'user',
          parts: [{ text: `${message}\n\n[Active Page Context: User is currently on the path '${pathname}']` }]
        });

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

        const fetchResponse = await fetch(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            },
            generationConfig: {
              maxOutputTokens: 1000,
              temperature: 0.7
            }
          })
        });

        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } else {
          const errorText = await fetchResponse.text();
          console.error("Gemini API call failed with status:", fetchResponse.status, errorText);
        }
      } catch (apiError) {
        console.error("Error communicating with Google Gemini API:", apiError);
      }
    }

    // 3. GRACEFUL LOCAL STREAM FALLBACK IF NO GEMINI KEY OR GEMINI FAILED
    if (!reply) {
      const matchedPrompt = Object.keys(AI_RESPONSES).find(
        p => queryLower.includes(p.toLowerCase()) || p.toLowerCase().includes(queryLower)
      );

      if (matchedPrompt) {
        reply = AI_RESPONSES[matchedPrompt];
      } else {
        if (pathname?.includes('/products')) {
          reply = "### 🧯 SG Fire Product Recommendations\n\nI see you are browsing our product catalog. Based on your safety search, I highly recommend looking at our certified **Class F Wet Chemical Extinguishers** for kitchens, or **Dry Powder Extinguishers** for multi-purpose hazard protection.\n\n* **Certification:** All our extinguishers are NFPA standard compliant.\n* **Maintenance:** Always check the pressure gauge needle is in the green zone once a month.";
        } else if (pathname?.includes('/cart') || pathname?.includes('/checkout')) {
          reply = "### 💳 Purchase & Compliance Help\n\nAre you finalizing your safety items? \n\n* **Compliance Certification:** Let me know if you need tax-compliant ISI certificates or NFPA test datasheets for your building inspector. We provide copies with all bulk orders.\n* **Delivery Policy:** pressurized cylinders are shipped via specialist hazardous-materials logistics channels to ensure zero-leakage delivery.";
        } else if (pathname?.includes('/appointments')) {
          reply = "### 🗓️ Service Inspection Guide\n\nPlanning a safety inspection or equipment certification?\n\n* **Our Technicians:** Every inspector is certified and fully trained on local municipal fire safety codes.\n* **Inspection Process:** We pressure-test cylinders, check alarm sensor battery loads, and inspect all safety exits.";
        } else {
          reply = `### 🧠 SG Fire Safety Advisor\n\nThank you for asking! I am analyzing your query about "${message}". As your fire safety expert co-pilot, I recommend:\n\n1. **Ensure Equipment is Certified:** Always purchase NFPA or national standard safety alarms and cylinders.\n2. **Check Placements:** Install smoke detectors in sleeping zones and corridors.\n3. **Avoid Water on Grease:** Remember, never throw water on grease or electrical fires.\n\n*Please type a specific safety question (e.g., kitchen hazards, smoke detector locations) to get highly structured guidelines.*`;
        }
      }
    }

    return res.status(200).json({
      success: true,
      reply,
      products: recommendedProducts
    });

  } catch (error) {
    console.error("Error inside handleAiChat controller:", error);
    return res.status(550).json({
      success: false,
      message: 'Internal server error during chatbot query processing'
    });
  }
};
