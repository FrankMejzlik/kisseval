{
    'targets': [
        {
            'target_name': 'build_all',
            'type': 'none',
            'dependencies': [
                'cppsrc/ImageRankerWrapper/binding.gyp:*', 
                'cppsrc/CEmbedSomWrapper/binding.gyp:*'
            ]
        }
    ]
}