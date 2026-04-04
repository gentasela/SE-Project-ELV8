char = input("Enter the character to use: ")
rows = int(input("Enter the number of lines: "))

for i in range(1, rows + 1):
    print(char * i)