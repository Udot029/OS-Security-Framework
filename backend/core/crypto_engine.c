#include <stdio.h>
#include <string.h>
int simple_hash(const char *input) {
    int hash = 0;
    for (int i = 0; i < strlen(input); i++) {
        hash += input[i];
    }
    return hash % 1000;  
}
int verify_integrity(const char *data, int expected_hash) {
    int current_hash = simple_hash(data);
    return (current_hash == expected_hash);
}