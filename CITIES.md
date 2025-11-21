# Adding New Cities to BeanGo

This guide explains how to add new cities to BeanGo. The app is designed to be easily expandable without requiring code changes.

## Quick Start

To add a new city, you need to:
1. Create challenge images
2. Add city data to the catalog file

That's it! No code changes required.

## Step 1: Prepare Challenge Images

### Image Requirements
- **Format**: PNG or JPG
- **Quantity**: 24 images per city (one per challenge)
- **Naming**: Use descriptive kebab-case names (e.g., `eiffel-tower-selfie.png`)

### Image Organization
Store all images in the `attached_assets/generated_images/` directory. We recommend organizing by city:

```
attached_assets/
└── generated_images/
    ├── caracas/
    │   ├── plaza_bolivar_colonial_buildings.png
    │   ├── venezuelan_arepa_food_photo.png
    │   └── ... (22 more images)
    └── paris/
        ├── eiffel-tower-selfie.png
        ├── louvre-museum-visit.png
        └── ... (22 more images)
```

## Step 2: Update the City Catalog

Edit `server/data/cities.json` to add your new city.

### Example: Adding Paris

```json
{
  "cities": [
    {
      "id": "caracas",
      "name": "Caracas",
      "country": "Venezuela",
      "challengeCount": 24,
      "challenges": [
        {
          "id": 1,
          "imageUrl": "/attached_assets/generated_images/plaza_bolivar_colonial_buildings.png",
          "caption": "Visit the historic Plaza Bolivar and take a photo with the statue"
        }
      ]
    },
    {
      "id": "paris",
      "name": "Paris",
      "country": "France",
      "challengeCount": 24,
      "challenges": [
        {
          "id": 1,
          "imageUrl": "/attached_assets/generated_images/paris/eiffel-tower-selfie.png",
          "caption": "Take a selfie at the Eiffel Tower"
        },
        {
          "id": 2,
          "imageUrl": "/attached_assets/generated_images/paris/louvre-museum-visit.png",
          "caption": "Visit the Louvre Museum and see the Mona Lisa"
        },
        {
          "id": 3,
          "imageUrl": "/attached_assets/generated_images/paris/croissant-breakfast.png",
          "caption": "Have a traditional French breakfast with croissants"
        }
      ]
    }
  ]
}
```

### Field Explanations

**City Object:**
- `id` (string, required): Unique identifier using kebab-case (e.g., "paris", "new-york")
- `name` (string, required): Display name of the city (e.g., "Paris")
- `description` (string, optional): Brief description of the city
- `country` (string, optional): Country name (e.g., "France")
- `challengeCount` (number, auto-calculated): Total number of challenges - automatically set to the length of the challenges array. You can include it in your JSON for clarity, but it will be overwritten with the actual count.

**Challenge Object:**
- `id` (number, required): Sequential number from 1-24
- `imageUrl` (string, required): Path to the challenge image starting with `/attached_assets/`
- `caption` (string, required): Description of the challenge activity

## Step 3: Validate and Restart

Before restarting, verify your JSON is valid:
- Use a JSON validator to check syntax
- Ensure each city has exactly 24 challenges
- Verify all image paths are correct and files exist

After updating `cities.json`, restart the BeanGo application. Your new city will automatically appear in the city selector when creating a room!

**Important:** The catalog is validated on startup. If there are errors in your JSON (missing required fields, invalid data types, etc.), the server will fail to start and show an error message. This helps catch mistakes early!

## Tips for Creating Great Challenges

### Challenge Variety
Include a mix of:
- **Landmarks**: Famous sites and monuments
- **Food**: Local cuisine experiences
- **Culture**: Museums, theaters, street art
- **Nature**: Parks, gardens, viewpoints
- **Local Life**: Markets, transportation, neighborhoods
- **Activities**: Unique local experiences

### Writing Captions
- Be specific and actionable
- Include the exact location or activity
- Keep it under 80 characters for best display
- Make it fun and engaging!

**Good Examples:**
- ✅ "Try an authentic croissant from a local boulangerie"
- ✅ "Take a photo at the Arc de Triomphe"
- ✅ "Ride the metro and visit Montmartre"

**Avoid:**
- ❌ "Eat food" (too vague)
- ❌ "Visit the extremely famous and well-known historical monument that everyone talks about" (too long)

## Troubleshooting

### City not appearing in selector
- Check that `cities.json` is valid JSON (use a JSON validator)
- Ensure the city `id` is unique
- Restart the application

### Images not loading
- Verify image paths start with `/attached_assets/`
- Check that image files exist at the specified paths
- Ensure image filenames match exactly (case-sensitive)

### Challenge count issues
- Each city must have exactly 24 challenges
- The `challengeCount` is automatically calculated from the challenges array length
- Server will fail to start if validation errors are found in cities.json

## Example: Complete City Entry

Here's a complete example for reference:

```json
{
  "id": "tokyo",
  "name": "Tokyo",
  "country": "Japan",
  "challengeCount": 24,
  "challenges": [
    {
      "id": 1,
      "imageUrl": "/attached_assets/generated_images/tokyo/shibuya-crossing.png",
      "caption": "Cross the famous Shibuya intersection"
    },
    {
      "id": 2,
      "imageUrl": "/attached_assets/generated_images/tokyo/ramen-bowl.png",
      "caption": "Try authentic Tokyo-style ramen"
    },
    ... (22 more challenges)
  ]
}
```

---

That's it! You're ready to expand BeanGo to cities around the world. Happy hunting! 🌎✨
