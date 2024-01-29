from PIL import Image
import os

# Get the list of all files and directories
path = "scrape-images"
dir_list = os.listdir(path)

print("Files and directories in '", path, "' :")

# prints all files
print("Number of files: " + str(len(dir_list)))
for filename in dir_list:
    # try:
    with Image.open(path + "/" + filename) as image:
        width, height = image.size

        if (width == height & height < 200):

            if os.path.exists(path + "/" + filename):
                os.rename(path + "/" + filename, path + "-pfp/" + filename)
                # try:

                # except:
                #     print("Error moving image")
            else:
                print("The file does not exist, can't remove")

    # except:
    #     print("Error opening image")
