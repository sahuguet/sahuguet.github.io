from openai import OpenAI
import requests
import os


if not os.environ.get('OPENAI_API_KEY'):
    raise ValueError("OPENAI_API_KEY environment variable is not set")


client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))


# Define the input sentence
system_prompt = "I am building a language learning app for 6 year olds. I need kid friendly colorful icons with no text."
topic = "brushing your teeth"
input_text = f"`{topic}` as a colorful kid-friendly icon"

# Call OpenAI's DALL·E 2 API
response = client.images.generate(prompt=input_text,
model="dall-e-2",
n=1,  
size="256x256")

# Extract the image URL
image_url = response.data[0].url
print("Generated Image URL:", image_url)

# Download and save the image
image_response = requests.get(image_url)

filename = f"{topic}.png".replace(" ", "_")
if image_response.status_code == 200:
    with open(filename, "wb") as file:
        file.write(image_response.content)
    print("Image downloaded successfully as 'generated_image.png'")
else:
    print("Failed to download image.")
