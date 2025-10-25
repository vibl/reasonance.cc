import csv
import sys
import os

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python articles_from_csv.py <csv_file_path> <output_directory>")
        sys.exit(1)

    csv_file_path = sys.argv[1]
    output_directory = sys.argv[2]

    if not os.path.exists(output_directory):
        os.makedirs(output_directory)

    with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            title = row['title']
            article = row['article']
            
            file_path = os.path.join(output_directory, f"{title}.md")
            
            with open(file_path, 'w', encoding='utf-8') as md_file:
                md_file.write(article)

    print(f"Successfully created markdown files in {output_directory}")
