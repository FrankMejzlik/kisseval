#pragma once

#define REPEAT_MAIN 1

#define CONCATENATE_LITERALS(A, B) A ## B
#define CONCATENATE_DEFINES(A, B) CONCATENATE_LITERALS(A, B)

#define NUM_ROWS 20000ULL

#define INDEX_OFFSET 50ULL

#define SOLUTION_PATH "C:\\Users\\devwe\\source\\repos\\blog-addons-example\\"

#define DATA_PATH CONCATENATE_DEFINES(SOLUTION_PATH, "\\data\\")
#define IMAGES_PATH CONCATENATE_DEFINES(SOLUTION_PATH, "\\data\\images\\")
#define COLLECTOR_INPUT_OUTPUT_DATA_PATH CONCATENATE_DEFINES(SOLUTION_PATH, "\\data\\to_collector\\")

#define GENERATE_COLLECTOR_INPUT_DATA 1

#define IMAGES_LIST_FILENAME "dir_images.txt"
#define KEYWORD_CLASSES_FILENAME "keyword_classes.txt"
#define DEEP_FEATURES_FILENAME "VBS2019_classification_NasNetMobile_20000.deep-features"
#define SOFTMAX_BIN_FILENAME "VBS2019_classification_NasNetLarge_20000.softmax"

#define SYNONYM_DELIMITER '#'
#define CSV_DELIMITER '~'

#define NUM_SUGESTIONS 5ULL