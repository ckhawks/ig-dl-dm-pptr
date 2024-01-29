from PIL import Image
import os

# Get the list of all files and directories
path = "scrape-images"
dir_list = os.listdir(path)

print("Files and directories in '", path, "' :")

# prints all files
print("Number of files: " + str(len(dir_list)))
for filename in dir_list:
    if not (filename == ".DS_Store"):

        # try:
        with Image.open(path + "/" + filename) as image:
            width, height = image.size
            print("Width " + str(width) + ", height " + str(height))
            if (width == 720 and height == 1280):
                print("1080x1920")
                if os.path.exists(path + "/" + filename):
                    os.rename(path + "/" + filename, path +
                              "-reelthumb/" + filename)
                    # try:

                    # except:
                    #     print("Error moving image")
                else:
                    print("The file does not exist, can't remove")  # 1284 × 2282
            if (width == 1284 and height == 2282):
                print("1080x1920")
                if os.path.exists(path + "/" + filename):
                    os.rename(path + "/" + filename, path +
                              "-reelthumb/" + filename)
                    # try:

                    # except:
                    #     print("Error moving image")
                else:
                    print("The file does not exist, can't remove")  # 1284 × 2282
    else:
        print(".DS_Store")
    # except:
    #     print("Error opening image")
