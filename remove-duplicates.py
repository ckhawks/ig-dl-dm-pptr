import difPy

if __name__ == '__main__':

    print("imported")
    dif = difPy.build("scrape-images", show_progress=True, px_size=100)
    print("built")
    search = difPy.search(dif, show_progress=True)
    print("searched")

    print(search.result)
    print(search.lower_quality)
    print("moving")
    search.move_to(destination_path="./scrape-removed/")
    print("moved")
