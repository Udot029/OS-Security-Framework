#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
int simple_hash(const char *input);
int verify_integrity(const char *data, int expected_hash);
static void to_lower_str(char *s) {
    for (; *s; ++s) *s = (char)tolower((unsigned char)*s);
}
static int parse_int(const char *s, int *out) {
    char *end = NULL;
    long v = strtol(s, &end, 10);
    if (end == s || *end != '\0') return 0; 
    *out = (int)v;
    return 1;
}
static void trim_newline(char *s) {
    size_t n = strlen(s);
    if (n && (s[n-1] == '\n' || s[n-1] == '\r')) s[n-1] = '\0';
}
int check_bell(int s_lvl, int o_lvl, const char* action) {
    if (strcmp(action, "read") == 0)  return (s_lvl >= o_lvl); // no read up
    if (strcmp(action, "write") == 0) return (s_lvl <= o_lvl); // no write down
    return -1;
}
int check_biba(int s_lvl, int o_lvl, const char* action) {
    if (strcmp(action, "read") == 0)  return (s_lvl <= o_lvl); // no read down
    if (strcmp(action, "write") == 0) return (s_lvl >= o_lvl); // no write up
    return -1;
}
int main(int argc, char *argv[]) {
    if (argc < 7) {
        fprintf(stderr, "Usage: guard <model> <s_lvl> <o_lvl> <action> <data> <hash>\n");
        return 2; 
    }
    char *model  = argv[1];
    int s_lvl = 0, o_lvl = 0;
    if (!parse_int(argv[2], &s_lvl) || !parse_int(argv[3], &o_lvl)) {
        fprintf(stderr, "Invalid numeric level(s)\n");
        return 2;
    }
    char action_buf[16];
    strncpy(action_buf, argv[4], sizeof(action_buf)-1);
    action_buf[sizeof(action_buf)-1] = '\0';
    to_lower_str(action_buf);
    char *data = argv[5];
    trim_newline(data);
    int expected_hash = 0;
    if (!parse_int(argv[6], &expected_hash)) {
        fprintf(stderr, "Invalid hash value\n");
        return 2;
    }
    if (!verify_integrity(data, expected_hash)) {
        fprintf(stderr, "Integrity check failed\n");
        return 2;
    }
    int result = -1;
    if (strcmp(model, "bell") == 0) {
        result = check_bell(s_lvl, o_lvl, action_buf);
    } else if (strcmp(model, "biba") == 0) {
        result = check_biba(s_lvl, o_lvl, action_buf);
    } else {
        fprintf(stderr, "Invalid model\n");
        return 2;
    }
    if (result == -1) {
        fprintf(stderr, "Invalid action (use read/write)\n");
        return 2;
    }
    printf("%d\n", result);
    return (result == 1) ? 0 : 1; 
}