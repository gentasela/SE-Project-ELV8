char = input("Type a character here: ")
rows = int(input("Enter the number of lines: "))

for i in range(1, rows + 1):
    print(char * i)