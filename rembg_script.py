from rembg import remove
from PIL import Image

input_path = 'public/time-saved-illustration.png'
output_path = 'public/time-saved-illustration.png'

input = Image.open(input_path)
output = remove(input)
output.save(output_path)
print("Successfully removed background from " + input_path)
