from PIL import Image
import os

def remove_checkerboard(image_path, output_path):
    print(f"Processing {image_path}...")
    try:
        img = Image.open(image_path).convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            r, g, b, a = item
            
            # The checkerboard is usually composed of pure white (255,255,255) 
            # and a specific light gray. We'll set a threshold for very light colors 
            # that are also grays/whites (where R, G, and B are similar and high).
            
            # Check if color is near white or light gray
            if (r > 200 and g > 200 and b > 200):
                # Calculate color distance to check if it's grayscale-ish
                if abs(r - g) < 20 and abs(r - b) < 20 and abs(g - b) < 20:
                     newData.append((255, 255, 255, 0)) # Make transparent
                else:
                    newData.append(item)
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(output_path, "PNG")
        print(f"Saved cleaned image to {output_path}")
    except Exception as e:
        print(f"Error processing {image_path}: {e}")

# Paths
dir_path = r"c:\Users\pc\Documents\app.g\gmail.app\public"
img1 = os.path.join(dir_path, "email-overload-illustration.png")
img2 = os.path.join(dir_path, "time-saved-illustration.png")

remove_checkerboard(img1, img1)
remove_checkerboard(img2, img2)
